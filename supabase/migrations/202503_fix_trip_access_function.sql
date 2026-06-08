-- Fix trip access function to use Revised Architecture access rules.
-- Ownership: trips.user_id
-- Access: active trip_collaborators
-- Pending invite visibility: pending/accepted trip_invites by email

create or replace function public.user_can_access_trip(target_trip_id bigint)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trips t
    where t.id = target_trip_id
      and t.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.trip_collaborators c
    where c.trip_id = target_trip_id
      and c.user_id = auth.uid()
      and c.active = true
  )
  or exists (
    select 1
    from public.trip_invites i
    where i.trip_id = target_trip_id
      and lower(i.email) = lower(auth.jwt() ->> 'email')
      and i.status in ('pending', 'accepted')
  );
$$;

drop policy if exists "Users can view owned or invited trips" on public.trips;

create policy "Users can view accessible trips"
on public.trips
for select
using (public.user_can_access_trip(id));
