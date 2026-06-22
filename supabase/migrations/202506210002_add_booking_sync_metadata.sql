-- Add sync metadata for collaborative/offline-safe itinerary bookings.

alter table public.bookings
add column if not exists created_at timestamptz not null default now(),
add column if not exists updated_at timestamptz not null default now(),
add column if not exists updated_by uuid null references auth.users(id),
add column if not exists deleted_at timestamptz null,
add column if not exists deleted_by uuid null references auth.users(id);

create index if not exists bookings_trip_active_start_time_idx
on public.bookings (trip_id, start_time)
where deleted_at is null;

create index if not exists bookings_trip_deleted_at_idx
on public.bookings (trip_id, deleted_at);
