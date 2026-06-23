-- Enable RLS for public tables reported by Supabase Security Advisor.
-- Uses existing public.user_can_access_trip(trip_id) access helper.

alter table public.packing_profiles enable row level security;
alter table public.packing_items enable row level security;
alter table public.trip_activity_log enable row level security;
alter table public.trip_ownership_transfers enable row level security;

-- ---------------------------------------------------------------------------
-- packing_profiles
-- ---------------------------------------------------------------------------

drop policy if exists "Users can read packing profiles for accessible trips"
on public.packing_profiles;

create policy "Users can read packing profiles for accessible trips"
on public.packing_profiles
for select
to authenticated
using (
  public.user_can_access_trip(trip_id)
);

drop policy if exists "Users can create packing profiles for accessible trips"
on public.packing_profiles;

create policy "Users can create packing profiles for accessible trips"
on public.packing_profiles
for insert
to authenticated
with check (
  public.user_can_access_trip(trip_id)
  and (owner_user_id is null or owner_user_id = auth.uid())
  and (created_by is null or created_by = auth.uid())
);

drop policy if exists "Users can update packing profiles for accessible trips"
on public.packing_profiles;

create policy "Users can update packing profiles for accessible trips"
on public.packing_profiles
for update
to authenticated
using (
  public.user_can_access_trip(trip_id)
)
with check (
  public.user_can_access_trip(trip_id)
);

drop policy if exists "Users can delete packing profiles for accessible trips"
on public.packing_profiles;

create policy "Users can delete packing profiles for accessible trips"
on public.packing_profiles
for delete
to authenticated
using (
  public.user_can_access_trip(trip_id)
);

-- ---------------------------------------------------------------------------
-- packing_items
-- packing_items are connected to trips through packing_profiles.
-- ---------------------------------------------------------------------------

drop policy if exists "Users can read packing items for accessible trips"
on public.packing_items;

create policy "Users can read packing items for accessible trips"
on public.packing_items
for select
to authenticated
using (
  exists (
    select 1
    from public.packing_profiles profile
    where profile.id = packing_items.packing_profile_id
      and public.user_can_access_trip(profile.trip_id)
  )
);

drop policy if exists "Users can create packing items for accessible trips"
on public.packing_items;

create policy "Users can create packing items for accessible trips"
on public.packing_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.packing_profiles profile
    where profile.id = packing_items.packing_profile_id
      and public.user_can_access_trip(profile.trip_id)
  )
);

drop policy if exists "Users can update packing items for accessible trips"
on public.packing_items;

create policy "Users can update packing items for accessible trips"
on public.packing_items
for update
to authenticated
using (
  exists (
    select 1
    from public.packing_profiles profile
    where profile.id = packing_items.packing_profile_id
      and public.user_can_access_trip(profile.trip_id)
  )
)
with check (
  exists (
    select 1
    from public.packing_profiles profile
    where profile.id = packing_items.packing_profile_id
      and public.user_can_access_trip(profile.trip_id)
  )
);

drop policy if exists "Users can delete packing items for accessible trips"
on public.packing_items;

create policy "Users can delete packing items for accessible trips"
on public.packing_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.packing_profiles profile
    where profile.id = packing_items.packing_profile_id
      and public.user_can_access_trip(profile.trip_id)
  )
);

-- ---------------------------------------------------------------------------
-- trip_activity_log
-- Browser code inserts activity rows, and RPC functions also insert rows.
-- ---------------------------------------------------------------------------

drop policy if exists "Users can read activity logs for accessible trips"
on public.trip_activity_log;

create policy "Users can read activity logs for accessible trips"
on public.trip_activity_log
for select
to authenticated
using (
  public.user_can_access_trip(trip_id)
);

drop policy if exists "Users can create activity logs for accessible trips"
on public.trip_activity_log;

create policy "Users can create activity logs for accessible trips"
on public.trip_activity_log
for insert
to authenticated
with check (
  public.user_can_access_trip(trip_id)
  and (actor_user_id is null or actor_user_id = auth.uid())
);

-- ---------------------------------------------------------------------------
-- trip_ownership_transfers
-- Ownership transfers are inserted by the security-definer RPC.
-- App users should only read transfer history for trips they can access.
-- ---------------------------------------------------------------------------

drop policy if exists "Users can read ownership transfers for accessible trips"
on public.trip_ownership_transfers;

create policy "Users can read ownership transfers for accessible trips"
on public.trip_ownership_transfers
for select
to authenticated
using (
  public.user_can_access_trip(trip_id)
);