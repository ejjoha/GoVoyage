-- Fix trip_invites direct-UPDATE authorization vulnerability.
--
-- Investigation (read-only, production, aggregate-only queries - no row
-- data/PII ever pulled) found that trip_invites had two direct UPDATE RLS
-- policies with no status or column restriction, and full table+column
-- UPDATE grants for anon/authenticated with no restriction beyond RLS:
--   - "Invited users can accept their own invites": USING/WITH CHECK was
--     just lower(email) = lower(auth.jwt() ->> 'email') - no status check,
--     no column restriction.
--   - "Trip owners and editors can update invites": owner-or-active-editor,
--     also no status or column restriction.
-- Every security-relevant column (trip_id, role, status, accepted_at,
-- inviter_user_id) was writable by anyone matching either policy.
-- accept_trip_invite() then trusted trip_id and role from the row
-- unconditionally. This enabled:
--   1. Trip-scope manipulation: an invitee could redirect their own pending
--      invite's trip_id to an arbitrary other trip and self-accept as
--      editor there.
--   2. Self-reinstatement after removal: a removed collaborator could reset
--      their own persisted, already-accepted invite's status back to
--      'pending' (and, since the same policy also covered accepted_at,
--      clear that too) and call accept_trip_invite() again to reactivate
--      themselves, bypassing remove_trip_collaborator()/leave_trip()
--      entirely.
--   3. Role escalation (dormant): trip_invites.role is constrained to
--      {editor, viewer}; confirmed via a fresh count(*) that no viewer-role
--      row has ever existed and today's app only ever creates editor
--      invites - so this path had nothing to escalate from in practice, but
--      was mechanically open.
--
-- Traced every legitimate writer of this table (accept_trip_invite,
-- decline_trip_invite, revoke_trip_invite, can_invite_to_trip, plus a full
-- app-code search): all three functions that write are SECURITY DEFINER and
-- perform their own internal UPDATE as the function owner, bypassing RLS
-- entirely - none of them, and no client code anywhere in the app, ever
-- depends on the caller holding direct UPDATE access to this table.
-- Reinvite-after-leave creates a fresh INSERT, never touches the old row.
-- Removing direct UPDATE access entirely preserves every legitimate flow.
--
-- Aggregate-only checks (no PII) found no evidence of exploitation in
-- current data - zero viewer-role rows, zero pending+accepted_at-not-null
-- rows, zero pending invites matching any existing collaborator relationship
-- (active or inactive) on the same trip. Reassuring, not conclusive (a
-- careful attacker could avoid every one of these signals) - the 4 invites
-- currently pending are invalidated below regardless, as a small-blast-
-- radius precaution rather than an attempt to distinguish legitimate from
-- tampered ones after the fact.
--
-- Remediation, in order:
--   1. Drop both direct UPDATE policies - no replacement. RLS default-deny
--      then blocks any direct client UPDATE outright, for any row.
--   2. Revoke the UPDATE table grant from anon/authenticated - defense in
--      depth at the grant layer, so a future accidental policy addition
--      alone wouldn't silently reopen direct write access.
--   3. Invalidate every currently-pending invite (status = 'expired', not
--      'revoked' - 'revoked' is tied to revoke_trip_invite()'s own
--      'invite_revoked' activity-log semantics, implying a specific owner
--      action, which wouldn't be true of a system-driven security
--      invalidation; 'expired' has no such existing meaning in this
--      codebase and is the more honest choice). Scoped to whatever is
--      status = 'pending' at the moment this runs, not a hardcoded id list.
--   4. Harden accept_trip_invite()'s gate with "and accepted_at is null" -
--      forward-looking defense in depth, not claimed as retroactively
--      conclusive (a careful attacker could have cleared accepted_at too,
--      before this fix closes that door). decline_trip_invite() and
--      revoke_trip_invite() are deliberately left unchanged - neither
--      grants privilege, so this fix stays scoped to what's actually
--      closing an authorization gap.

-- ---------------------------------------------------------------------------
-- 1. Drop both direct UPDATE policies. No "if exists" - both were just
-- freshly confirmed present in production; if either is somehow missing
-- when this runs, fail loudly rather than silently proceed against
-- unexpected state.
-- ---------------------------------------------------------------------------

drop policy "Invited users can accept their own invites" on public.trip_invites;

drop policy "Trip owners and editors can update invites" on public.trip_invites;

-- ---------------------------------------------------------------------------
-- 2. Revoke the UPDATE grant from client-facing roles. service_role and the
-- table owner (postgres) are untouched - the three writer functions run as
-- SECURITY DEFINER (owner privilege) and never depend on this grant.
-- ---------------------------------------------------------------------------

revoke update on public.trip_invites from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Invalidate every currently-pending invite.
-- ---------------------------------------------------------------------------

update public.trip_invites
set status = 'expired'
where status = 'pending';

-- ---------------------------------------------------------------------------
-- 4. Harden accept_trip_invite(): add "and accepted_at is null" to the
-- gate. Everything else in the function body is byte-identical to the live
-- definition.
-- ---------------------------------------------------------------------------

create or replace function public.accept_trip_invite(invite_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_trip_id bigint;
  target_role text;
  target_name text;
  target_email text;
  existing_member_id bigint;
begin
  select trip_id, role, name, email
  into target_trip_id, target_role, target_name, target_email
  from public.trip_invites
  where id = invite_id
    and lower(email) = lower(auth.jwt() ->> 'email')
    and status = 'pending'
    and accepted_at is null;

  if target_trip_id is null then
    raise exception 'Invite not found or is not pending.';
  end if;

  insert into public.trip_collaborators (trip_id, user_id, role, active, removed_at)
  values (target_trip_id, auth.uid(), target_role, true, null)
  on conflict (trip_id, user_id) do update
  set
    role = excluded.role,
    active = true,
    removed_at = null;

  select id
  into existing_member_id
  from public.trip_members
  where trip_id = target_trip_id
    and user_id = auth.uid()
  limit 1;

  if existing_member_id is null then
    insert into public.trip_members (trip_id, user_id, name, active)
    select
      target_trip_id,
      auth.uid(),
      coalesce(p.display_name, nullif(trim(target_name), ''), target_email, 'Traveller'),
      true
    from public.profiles p
    where p.user_id = auth.uid();

    if not found then
      insert into public.trip_members (trip_id, user_id, name, active)
      values (
        target_trip_id,
        auth.uid(),
        coalesce(nullif(trim(target_name), ''), target_email, 'Traveller'),
        true
      );
    end if;
  else
    update public.trip_members
    set active = true,
        archived_at = null
    where id = existing_member_id;
  end if;

  update public.trip_invites
  set accepted_at = now(),
      status = 'accepted'
  where id = invite_id
    and status = 'pending';

  insert into public.trip_activity_log (
    trip_id,
    actor_user_id,
    event_type,
    target_type,
    target_id,
    metadata
  )
  values (
    target_trip_id,
    auth.uid(),
    'invite_accepted',
    'trip_invite',
    invite_id,
    jsonb_build_object('role', target_role)
  );
end;
$$;

grant execute on function public.accept_trip_invite(bigint) to authenticated;
