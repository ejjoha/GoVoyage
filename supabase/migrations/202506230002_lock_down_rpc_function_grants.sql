-- Tighten SECURITY DEFINER RPC permissions.
-- Revoke broad PUBLIC/anon execution and grant only intentional access.

-- ---------------------------------------------------------------------------
-- App RPCs used directly by signed-in users
-- ---------------------------------------------------------------------------

revoke execute on function public.accept_trip_invite(bigint) from public;
revoke execute on function public.accept_trip_invite(bigint) from anon;
grant execute on function public.accept_trip_invite(bigint) to authenticated;

revoke execute on function public.decline_trip_invite(bigint) from public;
revoke execute on function public.decline_trip_invite(bigint) from anon;
grant execute on function public.decline_trip_invite(bigint) to authenticated;

revoke execute on function public.create_trip_with_owner(
  text,
  text,
  date,
  date,
  text,
  text[]
) from public;
revoke execute on function public.create_trip_with_owner(
  text,
  text,
  date,
  date,
  text,
  text[]
) from anon;
grant execute on function public.create_trip_with_owner(
  text,
  text,
  date,
  date,
  text,
  text[]
) to authenticated;

revoke execute on function public.archive_trip_member(bigint) from public;
revoke execute on function public.archive_trip_member(bigint) from anon;
grant execute on function public.archive_trip_member(bigint) to authenticated;

revoke execute on function public.leave_trip(bigint) from public;
revoke execute on function public.leave_trip(bigint) from anon;
grant execute on function public.leave_trip(bigint) to authenticated;

revoke execute on function public.remove_trip_collaborator(bigint, uuid) from public;
revoke execute on function public.remove_trip_collaborator(bigint, uuid) from anon;
grant execute on function public.remove_trip_collaborator(bigint, uuid) to authenticated;

revoke execute on function public.revoke_trip_invite(bigint) from public;
revoke execute on function public.revoke_trip_invite(bigint) from anon;
grant execute on function public.revoke_trip_invite(bigint) to authenticated;

revoke execute on function public.transfer_trip_ownership(bigint, uuid, text) from public;
revoke execute on function public.transfer_trip_ownership(bigint, uuid, text) from anon;
grant execute on function public.transfer_trip_ownership(bigint, uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Helper functions used by policies / access checks
-- Keep authenticated access, remove public/anon access.
-- ---------------------------------------------------------------------------

revoke execute on function public.user_can_access_trip(bigint) from public;
revoke execute on function public.user_can_access_trip(bigint) from anon;
grant execute on function public.user_can_access_trip(bigint) to authenticated;

revoke execute on function public.can_invite_to_trip(bigint, text) from public;
revoke execute on function public.can_invite_to_trip(bigint, text) from anon;
grant execute on function public.can_invite_to_trip(bigint, text) to authenticated;

revoke execute on function public.can_access_trip(bigint) from public;
revoke execute on function public.can_access_trip(bigint) from anon;
grant execute on function public.can_access_trip(bigint) to authenticated;

revoke execute on function public.user_has_trip_invite(bigint) from public;
revoke execute on function public.user_has_trip_invite(bigint) from anon;
grant execute on function public.user_has_trip_invite(bigint) to authenticated;

-- ---------------------------------------------------------------------------
-- Debug / maintenance functions
-- These should not be callable from the browser by anon or authenticated users.
-- ---------------------------------------------------------------------------

revoke execute on function public.debug_auth_uid() from public;
revoke execute on function public.debug_auth_uid() from anon;
revoke execute on function public.debug_auth_uid() from authenticated;
grant execute on function public.debug_auth_uid() to service_role;

revoke execute on function public.repair_collaborator_members() from public;
revoke execute on function public.repair_collaborator_members() from anon;
revoke execute on function public.repair_collaborator_members() from authenticated;
grant execute on function public.repair_collaborator_members() to service_role;