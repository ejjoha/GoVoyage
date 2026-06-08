-- Create trips transactionally through RPC so ownership and participation
-- are created together and RLS-sensitive insert/select behavior is avoided.

create or replace function public.create_trip_with_owner(
  p_title text,
  p_destination text,
  p_start_date date,
  p_end_date date,
  p_image_url text default null,
  p_currencies text[] default array['NOK','EUR','USD']
)
returns public.trips
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_user_email text := auth.jwt() ->> 'email';
  v_trip public.trips;
  v_display_name text;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to create a trip.';
  end if;

  select coalesce(display_name, email, v_user_email, 'Traveller')
  into v_display_name
  from public.profiles
  where user_id = v_user_id;

  insert into public.trips (
    title,
    destination,
    start_date,
    end_date,
    image_url,
    currencies,
    user_id
  )
  values (
    p_title,
    p_destination,
    p_start_date,
    p_end_date,
    nullif(p_image_url, ''),
    coalesce(p_currencies, array['NOK','EUR','USD']),
    v_user_id
  )
  returning * into v_trip;

  insert into public.trip_members (
    trip_id,
    user_id,
    name,
    active,
    archived_at
  )
  values (
    v_trip.id,
    v_user_id,
    coalesce(v_display_name, v_user_email, 'Traveller'),
    true,
    null
  )
  on conflict (trip_id, user_id)
  where user_id is not null
  do update set
    active = true,
    archived_at = null;

  return v_trip;
end;
$$;

grant execute on function public.create_trip_with_owner(
  text,
  text,
  date,
  date,
  text,
  text[]
) to authenticated;
