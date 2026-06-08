-- Allow trip owners and active collaborators to read active collaborator rows
-- for trips they can access. This lets People UI derive Editor badges
-- from trip_collaborators.active instead of trip_members.user_id.

drop policy if exists "Collaborators can read their own trip collaborations"
on public.trip_collaborators;

create policy "Users can read collaborators for accessible trips"
on public.trip_collaborators
for select
using (
  public.user_can_access_trip(trip_id)
);
