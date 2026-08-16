-- Fix trip_invites SELECT policy so an active editor can read back invites
-- they themselves created.
--
-- Diagnosed via qa-diagnose-insert-rejection.mjs (production, disposable
-- test data, cleaned up afterward): trip_invites INSERT is correctly scoped
-- to owner-or-active-editor (confirmed working by the 20260816164006
-- migration), but SELECT was scoped to owner-or-invitee only. Since
-- .insert(...).select(...) requires the inserted row to also satisfy the
-- table's SELECT policy, a non-owner active editor creating an invite gets
-- the entire insert transaction rolled back with a 42501 RLS error - even
-- though the row is never actually created and the underlying authorization
-- decision (should this editor be allowed to invite someone) was correct.
-- This affects app/trips/[id]/api.ts's createTripInvite(), which chains
-- .select("id").single() on the insert (added by the 20260816164006-era D1
-- fix, to get the invite id for the /api/send-trip-invite flow) - so every
-- non-owner editor's invite attempt through the real app has been silently
-- failing since that fix shipped.
--
-- Adds a third branch to the SELECT policy: the invite's own creator
-- (inviter_user_id = auth.uid()) may read it, but only while they are
-- currently an active editor collaborator on that trip. Deliberately NOT
-- "any active editor can see all invites on the trip" - that would let
-- editors browse invites created by other editors, which is not something
-- the app currently does or should silently start doing as a side effect
-- of this fix. Only the creator's own invites become visible via this
-- branch, and only while their editor access is still active.

drop policy "Trip owners can read invites"
on public.trip_invites;

create policy "Trip owners can read invites"
on public.trip_invites
as permissive
for select
to authenticated
using (
  exists (
    select 1
    from public.trips
    where trips.id = trip_invites.trip_id
      and trips.user_id = auth.uid()
  )
  or lower(email) = lower(auth.jwt() ->> 'email')
  or (
    inviter_user_id = auth.uid()
    and exists (
      select 1
      from public.trip_collaborators tc
      where tc.trip_id = trip_invites.trip_id
        and tc.user_id = auth.uid()
        and tc.role = 'editor'
        and tc.active = true
    )
  )
);
