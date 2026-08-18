# Production schema snapshots — historical audit evidence

This directory contains dated production-schema snapshots retained as
**historical audit evidence**.

**These files are not migrations.** Nothing here is intended to be applied,
run, or executed against any database — not production, not local, not a
preview branch.

**These files are not a current reference either.** A snapshot here records
what was true at the moment it was captured. It is **not a representation of
current production state** and must not be used as a substitute for current
introspection (`supabase db query --linked` against `information_schema` /
`pg_catalog` / `pg_policies`, etc.) or migration-ledger verification
(`supabase migration list --linked`). Schema, RLS policies, and function
definitions all continue to change after a snapshot is captured — see
"Superseded since capture" below for this file specifically.

## Files

- `production-schema-2026-08-16.sql` — records the schema/RLS/function state
  examined during the D7 schema/RLS visibility audit on 2026-08-16
  (`docs/D7_BRIEF.md`). Covers the `public` schema (tables, columns,
  constraints, RLS policies, `SECURITY DEFINER` function definitions,
  grants) plus the `storage.objects` policies and `storage.buckets` config
  relevant to the `journal-images` bucket, as they stood that day.

  Captured via targeted read-only SQL introspection
  (`supabase db query --linked`, hitting `information_schema` / `pg_catalog`
  / `pg_policies`) rather than `supabase db dump`, because `db dump` requires
  a local Docker daemon that wasn't available in the environment this was
  captured from. No table data, user records, or credentials were queried or
  captured — see the header of the file itself for exact scope and
  exclusions.

  ### Superseded since capture

  The following areas of `production-schema-2026-08-16.sql` no longer match
  production and must not be relied on:

  - **D7 active-collaborator fixes** (`20260816164006_fix_active_collaborator_checks.sql`,
    `20260816190238_fix_editor_invite_select_returning.sql`) — the six
    `active = true` authorization gaps this snapshot's audit found
    (`archive_trip_member()`, `revoke_trip_invite()`, the `trip_invites`
    INSERT/UPDATE policies, the `journal_entries` INSERT/SELECT policies)
    are fixed; the `trip_invites` SELECT policy shown here is also missing
    the later creator-visibility hotfix.
  - **`trip_invites` UPDATE / accept hardening**
    (`20260817154212_fix_trip_invites_update_authorization.sql`) — both
    direct UPDATE policies shown here (`"Invited users can accept their own
    invites"`, `"Trip owners and editors can update invites"`) have been
    dropped entirely; direct client UPDATE access to `trip_invites` no
    longer exists. `accept_trip_invite()`'s definition shown here is stale —
    it's missing the `accepted_at is null` hardening.
  - **D2 journal/storage changes**
    (`20260817170500_delete_disposable_journal_entries.sql`,
    `20260817170600_journal_image_path_and_storage_rls.sql`) —
    `journal_entries.image_url` has been renamed to `image_path` with a new
    `{tripId}/{journalEntryId}/{uuid}.{ext}` path scheme; the single
    `storage.objects` INSERT policy shown here has been dropped and replaced
    by an entry-scoped INSERT policy and a visibility-following SELECT
    policy; the `storage.buckets` config shown here
    (`public=true, file_size_limit=null, allowed_mime_types=null`) is wrong
    on all three fields — the bucket is now private with `image/*` and
    25,000,000-byte limits.

## If you're reconciling this against `supabase/migrations/`

Where this snapshot disagrees with what the tracked migrations would produce
if applied from scratch, check the "Superseded since capture" list above
first — the disagreement may simply be a later, already-applied migration
this file predates, not drift. For anything not listed above, treat neither
this file nor the migrations as automatically authoritative — verify against
current production introspection.
