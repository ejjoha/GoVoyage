-- Repair active collaborators so every active collaborator is also an active traveller.
-- Revised Architecture: Access != Participation, but every collaborator should have participation.

create or replace function public.repair_collaborator_members()
returns table (
  created_members integer,
  reactivated_members integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_created_members integer := 0;
  v_reactivated_members integer := 0;
begin
  create temp table repaired_members (
    trip_id bigint,
    member_id bigint,
    user_id uuid,
    repair_action text
  ) on commit drop;

  with created as (
    insert into public.trip_members (trip_id, user_id, name, active, archived_at)
    select
      c.trip_id,
      c.user_id,
      coalesce(p.display_name, p.email, 'Traveller'),
      true,
      null
    from public.trip_collaborators c
    left join public.trip_members m
      on m.trip_id = c.trip_id
     and m.user_id = c.user_id
    left join public.profiles p
      on p.user_id = c.user_id
    where c.active = true
      and m.id is null
    returning trip_id, id as member_id, user_id
  )
  insert into repaired_members (trip_id, member_id, user_id, repair_action)
  select trip_id, member_id, user_id, 'created'
  from created;

  get diagnostics v_created_members = row_count;

  with reactivated as (
    update public.trip_members m
    set
      active = true,
      archived_at = null
    from public.trip_collaborators c
    where c.active = true
      and c.trip_id = m.trip_id
      and c.user_id = m.user_id
      and m.active = false
    returning m.trip_id, m.id as member_id, m.user_id
  )
  insert into repaired_members (trip_id, member_id, user_id, repair_action)
  select trip_id, member_id, user_id, 'reactivated'
  from reactivated;

  get diagnostics v_reactivated_members = row_count;

  insert into public.trip_activity_log (
    trip_id,
    actor_user_id,
    event_type,
    target_type,
    target_id,
    metadata
  )
  select
    rm.trip_id,
    null,
    'traveller_linked_to_user',
    'member',
    rm.member_id,
    jsonb_build_object(
      'user_id', rm.user_id,
      'repair_action', rm.repair_action,
      'source', 'repair_collaborator_members'
    )
  from repaired_members rm;

  return query select v_created_members, v_reactivated_members;
end;
$$;

grant execute on function public.repair_collaborator_members() to authenticated;
