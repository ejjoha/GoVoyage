# D2 — Journal Image Storage Authorization Remediation

**Status: complete.**

## What was found

The `journal-images` Storage bucket was fully public (`public = true`, no `file_size_limit`, no `allowed_mime_types`) with exactly one `storage.objects` policy in the entire project: a bucket-wide INSERT policy for the `authenticated` role with no ownership, trip-membership, or path-scoping check at all — any authenticated user could upload to any path. There was no SELECT, UPDATE, or DELETE policy whatsoever, which was moot in practice because Supabase serves public-bucket objects through a separate `/object/public/` endpoint that bypasses RLS entirely.

`journal_entries.image_url` stored the full public URL returned by `getPublicUrl()` at upload time, rendered directly via `<img src>` with no signed-URL step. The upload path format was `{tripId}/{timestamp}.{ext}` — no journal-entry reference at all, so no policy could have enforced entry-level visibility even if one had existed.

Production held 4 journal entries (ids `3, 4, 5, 6`, all on trip 6) and 6 storage objects (~15 MB, all `image/jpeg`). All 4 entries were `visibility = 'private'` — meaning 100% of the "private" image corpus was technically publicly fetchable by anyone who knew or guessed a path. The journal feature was confirmed unreachable through the app's navigation, and both the entries and objects were confirmed disposable, allowing a clean-slate rebuild rather than a data migration.

## Remediation architecture

- **`journal_entries.image_url` renamed to `image_path`** (not replaced) — confirmed via a full codebase search plus a `pg_proc`/`pg_views`/`pg_trigger` scan that no DB function, trigger, or view referenced the column, and the only two app references (both in `app/trips/[id]/journal/page.tsx`) were rewritten alongside the migration.
- **New path format `{tripId}/{journalEntryId}/{uuid}.{ext}`** — embeds the entry id so Storage policies can verify against a real `journal_entries` row instead of trusting an arbitrary trip-shaped path.
- **Partial unique index** `journal_entries_image_path_key` on `image_path where image_path is not null`.
- **Entry-scope CHECK constraint** `journal_entries_image_path_scope_check`, enforcing `image_path ~ '^{trip_id}/{id}/[^/]+$'` using the row's own `trip_id`/`id` as a database invariant, not just an app-level convention.
- **Storage INSERT policy** ("Journal entry authors can upload their own entry's image") — the encoded `{tripId}/{journalEntryId}` prefix must resolve to a real `journal_entries` row with `created_by = auth.uid()` in the claimed trip. The numeric-format check runs inside a `CASE` (not a chained `AND`) so the `::bigint` casts only run once the format is confirmed numeric, avoiding a raw cast error on a malformed path.
- **Storage SELECT policy** ("Journal image access follows entry visibility") — grants access when a `journal_entries` row's `image_path` matches the object AND that row's `created_by` matches the object's original uploader (`storage.objects.owner_id`). Deliberately does **not** duplicate `journal_entries`' visibility boolean logic: a subquery against an RLS-enabled table is itself subject to that table's RLS, evaluated for the calling user, so the plain `EXISTS` inherits journal visibility (author, or active collaborator when `visibility = 'trip'`) automatically. `journal_entries` stays the single source of truth — if its SELECT policy changes, Storage access follows with no second copy to keep in sync.
- **No Storage UPDATE or DELETE policy** — deliberate, not an oversight. Nothing writes to an object in place (each save uploads to a fresh uuid-suffixed path) or deletes one client-side today; adding either policy now would be speculative.
- **Bucket flipped private**, with `allowedMimeTypes: ["image/*"]` and `fileSizeLimit: "25MB"`. The stored value resolves to **25,000,000 bytes** — the decimal (SI) interpretation of "25MB", not the binary/MiB interpretation (26,214,400 bytes); confirmed and accepted as-is.
- **Rendering via `createSignedUrls()`** at read time, 600-second (10 minute) TTL, batched for all entries in a single call. The signed URL is never persisted back to `journal_entries` — only `image_path` is stored.
- **New save sequencing**: insert the journal row (no `image_path` yet) → get the entry id → upload to the entry-scoped path → update the row's `image_path`. If the final update fails, the uploaded object is simply unreadable (no row references it) rather than a security exposure — no compensating rollback needed.

## Migrations

1. **`20260817170500_delete_disposable_journal_entries.sql`** — fail-closed reset. Wrapped in a `do $$ ... $$` block that reads the actual `journal_entries` id set, compares it to the exact expected array `{3,4,5,6}`, and `raise exception`s on any mismatch (extra row, missing row, already empty, different ids) rather than silently deleting a subset. Only proceeds to `delete ... where id in (3,4,5,6)` if the comparison matches exactly.
2. **`20260817170600_journal_image_path_and_storage_rls.sql`** — the full schema/RLS rebuild described above: column rename, unique index, CHECK constraint, drop of the old bucket-wide INSERT policy, and the two new Storage policies.

Both committed and merged via `feature/d2-journal-image-authorization`.

## Structural verification (production, read-only)

All checks passed cleanly after the real `db push`:

- `journal_entries` row count: `0`
- `image_path` column present; `image_url` column absent
- `journal_entries_image_path_key` unique index present, definition matches exactly
- `journal_entries_image_path_scope_check` CHECK present, definition matches exactly
- Old broad INSERT policy absent from `storage.objects`
- New entry-author INSERT policy present (`authenticated`, PERMISSIVE)
- New visibility-following SELECT policy present (`authenticated`, PERMISSIVE)
- No UPDATE policy, no DELETE policy — exactly 2 policies total exist on `storage.objects` project-wide
- Migration ledger: both `20260817170500` and `20260817170600` show `local == remote` (applied)

## Legacy object cleanup

The Supabase CLI's `storage rm` subcommand (`2.114.0`) unexpectedly required an undocumented `--experimental` flag not surfaced by its own `--help` output; rather than pass an experimental flag for a production delete, the same underlying Storage API call was made via a disposable Node script using `@supabase/supabase-js`'s `.remove()` (production-ref guard, service-role client, same pattern as every other disposable script this engagement). All 6 legacy objects removed; confirmed via a read-only `select count(*) from storage.objects where bucket_id = 'journal-images'` returning `0`.

## Deployment and QA

The reviewed branch was pushed to GitHub and deployed via the normal Vercel integration as a preview deployment (not merged to `main` first, so QA validated the exact reviewed candidate). Once the preview was confirmed healthy, `qa-journal-image-authorization.mjs` was run directly against it — no manual UI exploration first.

**12/12 checks passed:**

| # | Check | Result |
|---|---|---|
| 1 | Author signs her own private entry's image | PASS |
| 2 | Active collaborator (not author) cannot sign the private entry's image | PASS |
| 3 | Active collaborator can sign a `visibility='trip'` entry's image | PASS |
| 8 | Fetching the signed URL returns HTTP 200 (render path actually works) | PASS |
| 4 | Non-author cannot upload into another user's entry path | PASS |
| 5 | Author cannot upload to a syntactically-valid path with a nonexistent entry id | PASS |
| 6a | Anonymous fetch of the old public-object URL returns non-200 (HTTP 400) | PASS |
| 6b | Paired contrast: authorized signed URL returns 200, public URL does not | PASS |
| 7 | Anonymous (no session) client cannot mint a signed URL | PASS |
| 9 | Deactivating the collaborator revokes her `visibility='trip'` access | PASS |
| 10a | Orphan-reclaim attempt (unrelated user points her own entry at another user's orphaned object path) is rejected | PASS |
| 10b | The unrelated user never obtains a usable signed URL for the orphaned path | PASS |

### Interpreting check 10a precisely

The captured rejection error was: `new row for relation "journal_entries" violates check constraint "journal_entries_image_path_scope_check"`. This is direct empirical confirmation of what was documented as a scope note during design, not a surprise: **the CHECK constraint is the actual first-line defense** against orphan-reclaim. Because `journal_entries.id` is a never-reused identity column, no row but the original can ever structurally match another entry's `{trip_id}/{id}/` path prefix — the constraint alone makes cross-row `image_path` reuse impossible. The SELECT policy's `owner_id` binding (comparing the claiming row's `created_by` to the object's original uploader) is **defense-in-depth**, not independently load-bearing today: its protection is specifically against the CHECK constraint being weakened or removed later, or against a future write path that doesn't go through it (e.g. a service-role bulk-repair script). Both were implemented as designed; this distinction is recorded so the redundancy is legible on read rather than silently relied on.

## Cleanup confirmation

- Legacy 6 storage objects: removed via the Storage API, confirmed via read-only count = 0.
- QA test data (3 disposable accounts, 2 disposable trips, 3 test objects created during the run): all confirmed removed via admin read-back in the script's own cleanup step, not just "no error" from the delete calls.
- Disposable QA/cleanup scripts (`qa-journal-image-authorization.mjs`, `qa-d2-delete-legacy-journal-images.mjs`, `qa-d2-flip-bucket-private.mjs`): deleted from disk, never committed.
- `supabase/reference/` untouched throughout, as required.

## What's still open

- D2 itself is closed. Remaining, separate, unstarted work from the original D7 audit (documented in [D7_ACTIVE_COLLABORATOR_REMEDIATION.md](./D7_ACTIVE_COLLABORATOR_REMEDIATION.md)): a post-fix integrity review of existing `trip_collaborators`/`trip_invites` provenance. (`supabase/reference/` housekeeping, previously listed here, is resolved; the D7 evidence snapshot is now tracked and explicitly classified as historical audit evidence.)
