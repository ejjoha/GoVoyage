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
    and status = 'pending';

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