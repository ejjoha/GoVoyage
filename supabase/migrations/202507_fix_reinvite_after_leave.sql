create or replace function public.can_invite_to_trip(
  target_trip_id bigint,
  target_email text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(target_email);
  existing_user_id uuid;
begin
  if exists (
    select 1
    from public.trip_invites
    where trip_id = target_trip_id
      and lower(email) = normalized_email
      and status = 'pending'
  ) then
    return 'already_invited';
  end if;

  select user_id
  into existing_user_id
  from public.profiles
  where lower(email) = normalized_email
  limit 1;

  if existing_user_id is not null then
    if exists (
      select 1
      from public.trip_collaborators
      where trip_id = target_trip_id
        and user_id = existing_user_id
        and active = true
    ) then
      return 'already_collaborator';
    end if;
  end if;

  return 'ok';
end;
$$;

grant execute on function public.can_invite_to_trip(bigint, text) to authenticated;