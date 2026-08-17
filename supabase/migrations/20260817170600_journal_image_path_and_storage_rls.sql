-- D2 remediation: entry-scoped journal image authorization.
--
-- Replaces the previous public-bucket, no-real-authorization model for
-- journal-images with one where Storage access is derived directly from
-- journal_entries' own visibility rules - not a parallel "trip membership"
-- check that would let any active collaborator see a private entry's image.
--
-- image_url -> image_path: renamed, not replaced. Confirmed via a full
-- codebase search plus a pg_proc/pg_views/pg_trigger scan that the only two
-- references to journal_entries.image_url anywhere are in
-- app/trips/[id]/journal/page.tsx (read and write of the row itself), both
-- rewritten alongside this migration. No DB function, trigger, or view
-- references it. Every other image_url hit in the codebase belongs to
-- trips.image_url (the trip cover image) - an unrelated column.
--
-- New path format: {tripId}/{journalEntryId}/{uuid}.{ext} - embeds the
-- entry id so both the Storage INSERT policy and the new CHECK constraint
-- below can verify against a real journal_entries row instead of trusting
-- an arbitrary trip-shaped path.
--
-- Grants on storage.objects are deliberately left untouched - RLS
-- default-deny plus these two policies fully governs access, and
-- storage.objects is Storage's own shared table; narrowing its table-level
-- grants isn't scoped to this bucket and isn't needed here.

-- ---------------------------------------------------------------------------
-- 1. Rename the column. Table is empty (previous migration), so this is a
-- pure rename with no data to reconcile.
-- ---------------------------------------------------------------------------

alter table public.journal_entries
  rename column image_url to image_path;

-- ---------------------------------------------------------------------------
-- 2. Partial unique constraint - at most one journal_entries row may claim
-- a given storage path. Mirrors the pattern already used by
-- trip_invites_pending_email_key elsewhere in this schema.
-- ---------------------------------------------------------------------------

create unique index journal_entries_image_path_key
  on public.journal_entries (image_path)
  where image_path is not null;

-- ---------------------------------------------------------------------------
-- 3. Entry-scope CHECK constraint: enforces the {tripId}/{journalEntryId}/
-- prefix as a database invariant, not just an app-level convention. Uses
-- the row's own trip_id/id as literal (purely numeric, regex-metachar-free)
-- prefixes, so this is a safe self-referential per-row pattern.
--
-- Side effect worth noting for review: because journal_entries.id is a
-- never-reused identity column, this constraint alone already makes
-- cross-row image_path reuse structurally impossible - no other row can
-- ever match this exact {trip_id}/{id}/ prefix, past or future. See the
-- owner_id note on the SELECT policy below for how that interacts with
-- this constraint.
-- ---------------------------------------------------------------------------

alter table public.journal_entries
add constraint journal_entries_image_path_scope_check
check (
  image_path is null
  or image_path ~ ('^' || trip_id::text || '/' || id::text || '/[^/]+$')
);

-- ---------------------------------------------------------------------------
-- 4. Drop the old bucket-wide Storage INSERT policy. It let any
-- authenticated user upload to any path in this bucket, with no ownership
-- or entry-scoping check at all.
-- ---------------------------------------------------------------------------

drop policy "Authenticated journal image uploads 1hjo0y6_0" on storage.objects;

-- ---------------------------------------------------------------------------
-- 5. New Storage INSERT policy: the encoded {tripId}/{journalEntryId}
-- prefix must resolve to a real journal_entries row owned by the caller, in
-- the trip the path claims. storage.foldername(name) splits the object
-- path into its folder segments - [1] is tripId, [2] is journalEntryId.
--
-- The numeric-format check runs inside a CASE, not chained with AND,
-- specifically so the ::bigint casts are only reached once the format is
-- already confirmed numeric - Postgres does not guarantee left-to-right
-- short-circuit evaluation of a plain AND chain, but CASE WHEN branches are
-- guaranteed sequential. Without this, a malformed path segment would raise
-- a cast error instead of a clean policy rejection.
-- ---------------------------------------------------------------------------

create policy "Journal entry authors can upload their own entry's image"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'journal-images'
  and case
    when (storage.foldername(name))[1] ~ '^[0-9]+$'
     and (storage.foldername(name))[2] ~ '^[0-9]+$'
    then exists (
      select 1
      from public.journal_entries je
      where je.id = ((storage.foldername(name))[2])::bigint
        and je.trip_id = ((storage.foldername(name))[1])::bigint
        and je.created_by = auth.uid()
    )
    else false
  end
);

-- ---------------------------------------------------------------------------
-- 6. New Storage SELECT policy: an object is readable only if some
-- journal_entries row's image_path exactly matches it, that row's own
-- created_by matches the object's original uploader (storage.objects.
-- owner_id), and the row passes journal_entries' own RLS as the requesting
-- user.
--
-- Deliberately does NOT copy journal_entries' visibility boolean logic in
-- here - a subquery against an RLS-enabled table is itself subject to that
-- table's RLS, evaluated for the calling role/auth.uid(), so the plain
-- EXISTS below already only matches rows the caller could SELECT anyway.
-- journal_entries stays the single source of truth for visibility; if its
-- SELECT policy ever changes, Storage access follows automatically with no
-- second copy to keep in sync.
--
-- The owner_id match is a defense-in-depth binding against orphan-reclaim:
-- if an image's original journal_entries row is deleted or its image_path
-- replaced, the underlying object doesn't disappear from Storage. Without
-- this check, the concern is that anyone who once had legitimate
-- visibility into that image could create their own journal entry, set its
-- image_path to the orphaned object's path, and regain access to a file
-- they never uploaded. In practice the CHECK constraint above already
-- forecloses this for any *different* row (id is never reused, so no other
-- row's {trip_id}/{id}/ prefix can ever match an orphaned path), so this
-- clause's live protection today is specifically against that constraint
-- ever being weakened or removed later, or against any future write path
-- that doesn't go through it (e.g. a service-role bulk-repair script). Kept
-- as instructed, flagged here so the redundancy is legible on read rather
-- than silently relied on.
-- ---------------------------------------------------------------------------

create policy "Journal image access follows entry visibility"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'journal-images'
  and exists (
    select 1
    from public.journal_entries je
    where je.image_path = storage.objects.name
      and je.created_by::text = storage.objects.owner_id
  )
);

-- No Storage UPDATE or DELETE policy is added. The new save sequencing
-- always uploads to a fresh uuid-suffixed path rather than overwriting an
-- existing object in place, and nothing deletes objects client-side today -
-- adding either policy now would be speculative.
