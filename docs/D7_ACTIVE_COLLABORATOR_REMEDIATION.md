# D7 — Active-Collaborator Authorization Remediation

**Status: this specific remediation arc is complete.** The broader D7 audit is not — see "What's still open" at the end.

## What was fixed

D7 (`supabase/reference/production-schema-2026-08-16.sql`) found six authorization checks in production that granted "trip owner or editor" permission by testing `trip_collaborators.role = 'editor'` without also requiring `trip_collaborators.active = true` — unlike the correct pattern already used by `user_can_access_trip()`, `leave_trip()`, and `remove_trip_collaborator()`. A user removed from a trip (row set to `active = false`, never deleted) retained the ability to invite people, update/revoke invites, create/read trip-visibility journal entries, and archive other members on that trip indefinitely.

Two migrations were applied to production, in this order:

### 1. `20260816164006_fix_active_collaborator_checks.sql`
Adds `and active = true` to the six affected locations:
- `archive_trip_member()` function
- `revoke_trip_invite()` function
- `trip_invites` INSERT policy ("Trip owners and editors can create invites")
- `trip_invites` UPDATE policy ("Trip owners and editors can update invites")
- `journal_entries` INSERT policy ("Journal entries can be created by trip users")
- `journal_entries` SELECT policy ("Journal entries can be viewed by allowed users", trip-visibility branch)

No permission model, role, or membership lifecycle change — a one-clause correction applied six times, matching the pattern already proven correct elsewhere in the same schema.

### 2. `20260816190238_fix_editor_invite_select_returning.sql`
A same-day follow-up hotfix for a **separate, pre-existing regression** surfaced while testing migration #1. `trip_invites`'s SELECT policy was scoped to owner-or-invitee only, while INSERT (just fixed above) is scoped to owner-or-active-editor. Since `.insert(...).select(...)` requires the inserted row to also satisfy the table's SELECT policy — and PostgREST's behavior here is to **roll back the entire insert transaction**, not silently return a null row — any non-owner active editor creating a trip invite through the real app got the whole write rejected with a `42501` RLS error, even though the underlying INSERT authorization was correct. This affected `app/trips/[id]/api.ts`'s `createTripInvite()`, which chains `.select("id").single()` on the insert (added earlier, to get the invite id for the `/api/send-trip-invite` flow) — so every non-owner editor's invite attempt through the real app had been silently failing since that earlier change shipped.

The hotfix adds a third branch to the SELECT policy: the invite's own creator may read it, but only while currently an active editor collaborator on that trip. Deliberately **not** "any active editor can see all invites on the trip" — that would let editors browse invites created by other editors, which the app doesn't do and shouldn't start doing as a side effect of this fix.

## Final QA result

**19/19 checks passed**, unconfounded, via `qa-active-collaborator-check.mjs` (final revision). Covers all six locations from migration #1, using two fresh disposable test accounts (owner A, editor B) and one disposable trip per run:
- Positive controls while B is an active editor: create invite (4), revoke invite (5), directly UPDATE an invite she doesn't own (5b), create/read journal entries (6, 7), archive a member (8).
- Negative controls after A removes B (`remove_trip_collaborator`): all six rejected (10a–10d, 10f), journal read revoked (10e).
- Control: `10-invitee-control` — B retains SELECT access to her own original accepted invite via the unrelated invitee branch even after removal, proving the fix strips only editor-derived access, nothing else.
- Sanity: owner A's own access (11a–11d) is unaffected by any of the above.

### What the UPDATE negative test (10f) does and does not prove

`10f` has B (removed) attempt to update a dedicated invite (E, created by B while active, addressed to neither A nor B) that she updated successfully in `5b`. A confirms the value is unchanged afterward. **This proves the end-to-end security outcome — a removed editor's update attempt has no effect — but does not prove that outcome is caused specifically by the `active = true` clause in the UPDATE policy in isolation.** On this schema, B's SELECT visibility into invite E (via the SELECT hotfix's creator+active-editor branch) and her UPDATE access to it (via the "owners and editors" UPDATE policy's active-editor branch) both depend on the exact same `trip_collaborators.active` condition. Removing B strips both simultaneously, and black-box testing (real HTTP requests through the real API, no internal query-plan visibility) cannot separate "blocked because she can no longer see the row" from "blocked because the UPDATE policy's WITH CHECK now rejects her" — both are true at once. The defensible claim is the outcome, not attribution to one specific policy branch. This was confirmed to be an honest limit, not a gap in test design — see the diagnostic conclusions below.

## Diagnostic conclusions worth preserving

Three rounds of diagnosis were needed to reach a valid test design; the following are the reusable takeaways, not just historical narrative:

1. **`.insert(...).select(...)` on a table with RLS requires the resulting row to also satisfy the SELECT policy — and on violation, the entire transaction rolls back, not a silent partial success.** Confirmed via `qa-diagnose-insert-rejection.mjs`: a plain `.insert()` (no `.select()`) as a non-owner active editor succeeded and the row was independently confirmed to exist via the owner's read-back; the identical insert with `.select("id").single()` chained returned a `403`/`42501` error, and the owner's read-back afterward found **zero rows** — the row was never persisted at all, not written-but-unreturnable. This was the root cause of the regression migration #2 fixes, and is a general pattern worth remembering for any future `.insert().select()` call in this codebase: the SELECT policy is load-bearing for RETURNING, not just for direct reads.

2. **The SELECT/UPDATE interaction discovered during the email-change investigation.** `trip_invites` has a second, independent UPDATE policy ("Invited users can accept their own invites") whose `USING`/`WITH CHECK` is `lower(email) = lower(auth.jwt() ->> 'email')` — confirmed via a fresh read-only `pg_policies` query to have an explicit `WITH CHECK`, identical to `USING`, not omitted/inherited. An early test design attempted to change B's own original invite's `email` field to isolate the "owners and editors" UPDATE policy's `active = true` clause specifically (the theory being: changing email defeats the invitee policy's `WITH CHECK` regardless of editor status, forcing the update through the other policy). Empirically this failed: `qa-diagnose-update-select-interaction.mjs` captured the full error object and found the update was rejected with an explicit `42501` even while B was still an active editor — changing the invite's email breaks the invitee SELECT branch's email match at the same time it breaks the invitee UPDATE policy's `WITH CHECK`, and the exact mechanism by which this blocks the "owners and editors" path too was not fully attributable to one specific cause through black-box testing alone.

3. **Why the email-change experiment was invalid and had to be replaced.** Because the email-change update failed identically whether B was active or removed, it could not distinguish "editor access working" from "editor access blocked" — it was uninformative as either a positive or a negative control, not just a flawed negative test. It was replaced entirely (not patched) with the dedicated-invite-E design: an invite addressed to neither A nor B, created by B while active, updated via the harmless `name` field. This gives a clean positive contrast (`5b`, active B succeeds) against a real negative result (`10f`, removed B's identical attempt has no effect), with the caveat above about not over-attributing the negative result's cause.

## Test data discipline

All three scripts used today (`qa-active-collaborator-check.mjs`, `qa-diagnose-insert-rejection.mjs`, `qa-diagnose-update-select-interaction.mjs`) created fresh, disposable `@example.com` test accounts and one disposable trip per run, using the same anon-key session pattern the real app uses for every authorization check — service-role was used only for a pre-flight credential check and final cleanup, never inside a check itself. Each run's cleanup deleted the trip first (confirmed gone via a service-role read-back, not just "no error" from the delete call, with a force-delete fallback), then deleted the test accounts only once trip absence was positively confirmed. All runs completed cleanup successfully; nothing was left in production. The three scripts themselves were disposable and were never committed to git (confirmed untracked throughout) — deleted from disk once this document was written.

## What's still open

This document closes out the `active = true` remediation arc only. The broader D7 audit is **not** complete:

- **Resolved separately**: the "Invited users can accept their own invites" UPDATE policy's missing column restriction was investigated, confirmed exploitable (trip-scope manipulation and self-reinstatement replay), and fixed in a dedicated follow-up arc — see [D7_TRIP_INVITES_UPDATE_AUTHORIZATION_REMEDIATION.md](./D7_TRIP_INVITES_UPDATE_AUTHORIZATION_REMEDIATION.md).
- **D2** (public `journal-images` storage bucket undermining the app's private-visibility model, identified in the original D7 report) remains queued, separate, unstarted work.
- Any other findings from the original D7 audit not explicitly addressed above remain outstanding.
