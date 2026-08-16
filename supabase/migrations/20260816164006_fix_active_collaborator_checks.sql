-- Fix missing active = true check on editor-role authorization.
--
-- D7 (see supabase/reference/production-schema-2026-08-16.sql) found that six
-- checks grant "trip owner or editor" permission by testing
-- trip_collaborators.role = 'editor' without also requiring
-- trip_collaborators.active = true, unlike the already-correct pattern used
-- by user_can_access_trip(), leave_trip() and remove_trip_collaborator().
--
-- Effect of the bug: a user removed from a trip (trip_collaborators.active
-- set to false, row never deleted) retained the ability to invite people,
-- update/revoke invites, and create/read trip-visibility journal entries,
-- and archive other members on that trip indefinitely.
--
-- This migration adds the missing "and active = true" condition in the six
-- affected locations only. No permission model, role, or membership
-- lifecycle change.

-- ---------------------------------------------------------------------------
-- 1/6: archive_trip_member() — add active = true to the editor check
-- ---------------------------------------------------------------------------

create or replace function public.archive_trip_member(member_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_trip_id bigint;
  target_user_id uuid;
  owner_user_id uuid;
begin
  select tm.trip_id, tm.user_id, t.user_id
  into target_trip_id, target_user_id, owner_user_id
  from public.trip_members tm
  join public.trips t
    on t.id = tm.trip_id
  where tm.id = member_id
    and tm.active = true;

  if target_trip_id is null then
    raise exception 'Traveller not found or already archived.';
  end if;

  if target_user_id = owner_user_id then
    raise exception 'Trip owner cannot be archived.';
  end if;

  if not (
    exists (
      select 1
      from public.trips
      where id = target_trip_id
        and user_id = auth.uid()
    )
    or exists (
      select 1
      from public.trip_collaborators
      where trip_id = target_trip_id
        and user_id = auth.uid()
        and role = 'editor'
        and active = true
    )
  ) then
    raise exception 'You do not have permission to archive this traveller.';
  end if;

  update public.trip_members
  set
    active = false,
    archived_at = now()
  where id = member_id
    and active = true;

  insert into public.trip_activity_log (
    trip_id,
    actor_user_id,
    event_type,
    target_type,
    target_id
  )
  values (
    target_trip_id,
    auth.uid(),
    'traveller_archived',
    'trip_member',
    member_id
  );
end;
$$;

grant execute on function public.archive_trip_member(bigint) to authenticated;

-- ---------------------------------------------------------------------------
-- 2/6: revoke_trip_invite() — add active = true to the editor check
-- ---------------------------------------------------------------------------

create or replace function public.revoke_trip_invite(invite_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_trip_id bigint;
begin
  select trip_id
  into target_trip_id
  from public.trip_invites
  where id = invite_id
    and status = 'pending';

  if target_trip_id is null then
    raise exception 'Invite not found or is not pending.';
  end if;

  if not (
    exists (
      select 1
      from public.trips
      where id = target_trip_id
        and user_id = auth.uid()
    )
    or exists (
      select 1
      from public.trip_collaborators
      where trip_id = target_trip_id
        and user_id = auth.uid()
        and role = 'editor'
        and active = true
    )
  ) then
    raise exception 'You do not have permission to revoke this invite.';
  end if;

  update public.trip_invites
  set status = 'revoked'
  where id = invite_id
    and status = 'pending';

  insert into public.trip_activity_log (
    trip_id,
    actor_user_id,
    event_type,
    target_type,
    target_id
  )
  values (
    target_trip_id,
    auth.uid(),
    'invite_revoked',
    'trip_invite',
    invite_id
  );
end;
$$;

grant execute on function public.revoke_trip_invite(bigint) to authenticated;

-- ---------------------------------------------------------------------------
-- 3/6: trip_invites INSERT policy — add active = true to the editor branch
-- ---------------------------------------------------------------------------

drop policy if exists "Trip owners and editors can create invites"
on public.trip_invites;

create policy "Trip owners and editors can create invites"
on public.trip_invites
for insert
to authenticated
with check (
  exists (
    select 1
    from public.trips
    where trips.id = trip_invites.trip_id
      and trips.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.trip_collaborators
    where trip_collaborators.trip_id = trip_invites.trip_id
      and trip_collaborators.user_id = auth.uid()
      and trip_collaborators.role = 'editor'
      and trip_collaborators.active = true
  )
);

-- ---------------------------------------------------------------------------
-- 4/6: trip_invites UPDATE policy — add active = true to the editor branch
-- ---------------------------------------------------------------------------

drop policy if exists "Trip owners and editors can update invites"
on public.trip_invites;

create policy "Trip owners and editors can update invites"
on public.trip_invites
for update
using (
  exists (
    select 1
    from public.trips
    where trips.id = trip_invites.trip_id
      and trips.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.trip_collaborators
    where trip_collaborators.trip_id = trip_invites.trip_id
      and trip_collaborators.user_id = auth.uid()
      and trip_collaborators.role = 'editor'
      and trip_collaborators.active = true
  )
)
with check (
  exists (
    select 1
    from public.trips
    where trips.id = trip_invites.trip_id
      and trips.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.trip_collaborators
    where trip_collaborators.trip_id = trip_invites.trip_id
      and trip_collaborators.user_id = auth.uid()
      and trip_collaborators.role = 'editor'
      and trip_collaborators.active = true
  )
);

-- ---------------------------------------------------------------------------
-- 5/6: journal_entries INSERT policy — add active = true to the
-- collaborator branch
-- ---------------------------------------------------------------------------

drop policy if exists "Journal entries can be created by trip users"
on public.journal_entries;

create policy "Journal entries can be created by trip users"
on public.journal_entries
for insert
with check (
  created_by = auth.uid()
  and (
    exists (
      select 1
      from public.trips
      where trips.id = journal_entries.trip_id
        and trips.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.trip_collaborators
      where trip_collaborators.trip_id = journal_entries.trip_id
        and trip_collaborators.user_id = auth.uid()
        and trip_collaborators.active = true
    )
  )
);

-- ---------------------------------------------------------------------------
-- 6/6: journal_entries SELECT policy — add active = true to the
-- trip-visibility branch
-- ---------------------------------------------------------------------------

drop policy if exists "Journal entries can be viewed by allowed users"
on public.journal_entries;

create policy "Journal entries can be viewed by allowed users"
on public.journal_entries
for select
using (
  created_by = auth.uid()
  or (
    visibility = 'trip'
    and exists (
      select 1
      from public.trip_collaborators
      where trip_collaborators.trip_id = journal_entries.trip_id
        and trip_collaborators.user_id = auth.uid()
        and trip_collaborators.active = true
    )
  )
);
