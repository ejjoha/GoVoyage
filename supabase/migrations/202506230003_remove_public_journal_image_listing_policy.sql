-- Remove broad public storage SELECT policy that allows listing journal images.
-- Public bucket object URLs can still serve known image paths without this policy.

drop policy if exists "Public journal image viewing 1hjo0y6_0"
on storage.objects;