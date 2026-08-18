-- D5 remediation: make expense + participant writes atomic.
--
-- updateExpense() (app/trips/[id]/cost-sharing/api.ts) currently does three
-- sequential, unguarded network calls: UPDATE expenses, then DELETE all
-- expense_participants for that expense, then INSERT the new participant
-- set. If the INSERT fails after the DELETE has already succeeded - a
-- network error, an RLS denial, a constraint violation - the expense is
-- left with its new amount/currency but zero participants. Downstream,
-- calculateGroupedSummary() skips zero-participant expenses when computing
-- balances while totalCostByCurrency does not, so the displayed total and
-- the displayed per-person balances desync. createExpense() has a similar
-- but narrower exposure: it does compensate for a failed participant
-- insert by deleting the just-created expense, but that compensation is
-- itself a second unguarded call, so a second failure (the compensating
-- delete also failing) reproduces the same zero-participant orphan.
--
-- Both are replaced with a single SECURITY DEFINER RPC each. All
-- statements inside a plpgsql function body execute in the same
-- transaction as the RPC call itself: if any statement raises, everything
-- the function did - including statements that "succeeded" moments
-- earlier in the same call - rolls back automatically, with no explicit
-- BEGIN/COMMIT needed. This is the same guarantee create_trip_with_owner()
-- and transfer_trip_ownership() already rely on elsewhere in this schema,
-- not a new pattern.
--
-- Authorization: expenses' and expense_participants' RLS policies all key
-- off the identical predicate (user_can_access_trip(trip_id) directly, or
-- via an EXISTS join to expenses.trip_id for expense_participants) -
-- confirmed via a fresh pg_policies read before drafting this. That
-- symmetry is why the existing client-side .insert(...).select() calls
-- were never at risk of the D1-class RETURNING/SELECT-policy mismatch.
-- But a SECURITY DEFINER function bypasses RLS entirely for its own
-- internal writes, so each function below performs its own explicit
-- user_can_access_trip() check before mutating anything - RLS is not
-- doing this for us here.
--
-- Critical for the update function specifically: trip_id is deliberately
-- NOT a parameter. If it were caller-supplied, a caller could pass an
-- expense_id belonging to a trip they can't access alongside a trip_id for
-- a trip they can access, and the authorization check would pass against
-- the wrong trip entirely. Instead, the function looks up the expense
-- first and derives its actual, current trip_id from that row - the only
-- value ever checked or trusted. The existence check, the access check,
-- and the row lock are combined into one SELECT ... FOR UPDATE: a
-- nonexistent expense_id and an inaccessible one both fail with the same
-- "not found or access denied" exception, so the error itself doesn't
-- leak which case occurred, and there's no window between checking access
-- and locking the row for a concurrent change to slip through.
--
-- Every boolean authorization check uses IS TRUE / IS NOT TRUE rather than
-- a bare condition - user_can_access_trip() returning NULL (which a bare
-- `if not ...` would silently treat as "proceed") must fail closed, not
-- pass by accident.
--
-- Both functions reject an empty/null participant array before any
-- mutation - otherwise the RPC could be called directly (bypassing the
-- app's own form validation) to intentionally produce the exact
-- zero-participant state this migration exists to prevent. Both also
-- verify the payer and every participant actually belong to the
-- authoritative trip, not just that the caller can access it - deliberately
-- without an `active = true` filter on trip_members, since historical
-- expenses may legitimately reference travellers later archived, and nothing
-- about this migration should change who a past expense is allowed to
-- reference.
--
-- No exception handling of any kind is used in either function body. An
-- unhandled error already aborts and rolls back the whole call, which is
-- exactly the guarantee this migration exists to provide - catching and
-- suppressing an error here would defeat it.
--
-- Scope note, worth stating plainly rather than implying more than what
-- was actually achieved: these RPCs make the app's own create/update paths
-- atomic. The underlying expenses/expense_participants tables still carry
-- their existing direct-write RLS policies (INSERT/UPDATE/DELETE all
-- gated on user_can_access_trip(trip_id)), so a client bypassing these
-- RPCs and writing to the tables directly could still reproduce D5's
-- failure mode. Revoking those direct-write grants was considered and
-- deliberately not done here - it risks breaking anything else that may
-- depend on them, and was out of scope for this fix. This migration closes
-- the gap in the paths the app actually uses; it is not a database-level
-- guarantee that the zero-participant state is now structurally
-- impossible.

-- ---------------------------------------------------------------------------
-- 1. update_expense_with_participants
-- ---------------------------------------------------------------------------

create or replace function public.update_expense_with_participants(
  p_expense_id bigint,
  p_title text,
  p_amount numeric,
  p_currency text,
  p_expense_date date,
  p_paid_by_member_id bigint,
  p_participant_member_ids bigint[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_trip_id bigint;
begin
  select e.trip_id
  into v_trip_id
  from public.expenses e
  where e.id = p_expense_id
    and public.user_can_access_trip(e.trip_id) is true
  for update;

  if not found then
    raise exception 'Expense not found or access denied.';
  end if;

  if coalesce(cardinality(p_participant_member_ids), 0) = 0 then
    raise exception 'At least one expense participant is required.';
  end if;

  if not exists (
    select 1 from public.trip_members tm
    where tm.id = p_paid_by_member_id and tm.trip_id = v_trip_id
  ) then
    raise exception 'Expense payer must belong to this trip.';
  end if;

  if exists (
    select 1 from unnest(p_participant_member_ids) as p(member_id)
    where not exists (
      select 1 from public.trip_members tm
      where tm.id = p.member_id and tm.trip_id = v_trip_id
    )
  ) then
    raise exception 'All expense participants must belong to this trip.';
  end if;

  update public.expenses
  set
    title = p_title,
    amount = p_amount,
    currency = p_currency,
    expense_date = p_expense_date,
    paid_by_member_id = p_paid_by_member_id
  where id = p_expense_id;

  delete from public.expense_participants
  where expense_id = p_expense_id;

  insert into public.expense_participants (expense_id, member_id)
  select p_expense_id, member_id
  from unnest(p_participant_member_ids) as member_id;
end;
$function$;

revoke execute on function public.update_expense_with_participants(
  bigint, text, numeric, text, date, bigint, bigint[]
) from public;
revoke execute on function public.update_expense_with_participants(
  bigint, text, numeric, text, date, bigint, bigint[]
) from anon;
grant execute on function public.update_expense_with_participants(
  bigint, text, numeric, text, date, bigint, bigint[]
) to authenticated;

-- ---------------------------------------------------------------------------
-- 2. create_expense_with_participants
--
-- No expense exists yet at call time, so there's nothing to derive a trip
-- from - the caller supplies the target trip directly, and it's authorized
-- before anything is inserted.
-- ---------------------------------------------------------------------------

create or replace function public.create_expense_with_participants(
  p_trip_id bigint,
  p_title text,
  p_amount numeric,
  p_currency text,
  p_expense_date date,
  p_paid_by_member_id bigint,
  p_participant_member_ids bigint[]
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_expense_id bigint;
begin
  if public.user_can_access_trip(p_trip_id) is not true then
    raise exception 'You do not have permission to add expenses to this trip.';
  end if;

  if coalesce(cardinality(p_participant_member_ids), 0) = 0 then
    raise exception 'At least one expense participant is required.';
  end if;

  if not exists (
    select 1 from public.trip_members tm
    where tm.id = p_paid_by_member_id and tm.trip_id = p_trip_id
  ) then
    raise exception 'Expense payer must belong to this trip.';
  end if;

  if exists (
    select 1 from unnest(p_participant_member_ids) as p(member_id)
    where not exists (
      select 1 from public.trip_members tm
      where tm.id = p.member_id and tm.trip_id = p_trip_id
    )
  ) then
    raise exception 'All expense participants must belong to this trip.';
  end if;

  insert into public.expenses (
    trip_id, title, amount, currency, expense_date, paid_by_member_id
  )
  values (
    p_trip_id, p_title, p_amount, p_currency, p_expense_date, p_paid_by_member_id
  )
  returning id into v_expense_id;

  insert into public.expense_participants (expense_id, member_id)
  select v_expense_id, member_id
  from unnest(p_participant_member_ids) as member_id;

  return v_expense_id;
end;
$function$;

revoke execute on function public.create_expense_with_participants(
  bigint, text, numeric, text, date, bigint, bigint[]
) from public;
revoke execute on function public.create_expense_with_participants(
  bigint, text, numeric, text, date, bigint, bigint[]
) from anon;
grant execute on function public.create_expense_with_participants(
  bigint, text, numeric, text, date, bigint, bigint[]
) to authenticated;
