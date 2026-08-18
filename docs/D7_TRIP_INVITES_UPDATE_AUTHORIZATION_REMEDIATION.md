# D7 — `trip_invites` Direct-UPDATE Authorization Remediation

**Status: this remediation arc is complete.** This is a separate arc from [D7_ACTIVE_COLLABORATOR_REMEDIATION.md](./D7_ACTIVE_COLLABORATOR_REMEDIATION.md) — that document covers the six `active = true` authorization gaps found during the original D7 schema audit; this one covers a distinct vulnerability in `trip_invites`'s UPDATE policies that was queued (not investigated) at the time that document was written.

## What was found

`trip_invites` had two permissive UPDATE RLS policies, each with no status or column restriction beyond its own authorization test:

- **"Invited users can accept their own invites"** — `USING`/`WITH CHECK` was just `lower(email) = lower(auth.jwt() ->> 'email')`. No status check, no column restriction.
- **"Trip owners and editors can update invites"** — owner-or-active-editor (post the D1 `active = true` fix). Also no status or column restriction.

Combined with full table+column UPDATE grants for `anon`/`authenticated` and no restriction beyond RLS, every security-relevant column on the table (`trip_id`, `role`, `status`, `accepted_at`, `inviter_user_id`) was writable by anyone matching either policy. `accept_trip_invite()` then trusted `trip_id` and `role` from the row unconditionally when creating the collaborator record. This enabled three paths:

1. **Trip-scope manipulation.** An invitee could redirect their own pending invite's `trip_id` to an arbitrary other trip and self-accept as editor there — a trip they were never invited to.
2. **Self-reinstatement after removal (replay).** A removed collaborator could reset their own persisted, already-accepted invite's `status` back to `'pending'` (and, since the same policy covered `accepted_at`, clear that too) and call `accept_trip_invite()` again to reactivate themselves — bypassing `remove_trip_collaborator()`/`leave_trip()` entirely.
3. **Role escalation (dormant).** `trip_invites.role` is constrained to `{editor, viewer}`; a fresh `count(*)` confirmed no viewer-role row has ever existed and the app only ever creates editor invites — so this path had nothing to escalate from in practice, but was mechanically open.

All three legitimate writers of this table — `accept_trip_invite()`, `decline_trip_invite()`, `revoke_trip_invite()` — are `SECURITY DEFINER` and perform their own internal UPDATE as the function owner, bypassing RLS entirely. A full app-code search confirmed no client code anywhere depends on holding direct UPDATE access to this table. Reinvite-after-leave creates a fresh INSERT and never touches the old row. Removing direct UPDATE access entirely preserves every legitimate flow.

Aggregate-only, zero-PII checks against production data before the fix found no evidence of exploitation: zero viewer-role rows, zero pending+`accepted_at`-not-null rows, zero pending invites matching any existing collaborator relationship (active or inactive) on the same trip. **Reassuring, not conclusive** — a careful attacker could avoid every one of these signals (e.g. clearing `accepted_at` when resetting `status`, or manipulating a trip with no still-existing collaborator record to cross-check against). This checked for signs of exploitation; it does not prove none occurred.

## Remediation — `20260817154212_fix_trip_invites_update_authorization.sql`

Applied to production in one migration, in order:

1. **Drop both direct UPDATE policies**, no replacement. RLS default-deny then blocks any direct client UPDATE outright, for any row.
2. **Revoke the UPDATE table grant** from `anon`/`authenticated` — defense in depth at the grant layer, so a future accidental policy addition alone wouldn't silently reopen direct write access.
3. **Invalidate every currently-pending invite** (`status = 'expired'`, scoped to whatever was `status = 'pending'` at the moment the migration ran — not a hardcoded id list). `'expired'` rather than `'revoked'`: `'revoked'` is tied to `revoke_trip_invite()`'s own `invite_revoked` activity-log semantics, implying a specific owner action, which wouldn't be true of a system-driven security invalidation. This was a small-blast-radius precaution, not an attempt to distinguish legitimate from tampered invites after the fact.
4. **Harden `accept_trip_invite()`**: add `and accepted_at is null` to the function's gate. Forward-looking defense in depth, not claimed as retroactively conclusive — a careful attacker could have cleared `accepted_at` too, before this fix closed that door. `decline_trip_invite()` and `revoke_trip_invite()` were deliberately left unchanged — neither grants privilege, so the fix stayed scoped to what was actually closing an authorization gap.

## Verification

### Structural verification (7/7, read-only, production)

1. Migration list shows `20260817154212` applied (`local` and `remote` both present).
2. Zero UPDATE policies remain on `trip_invites` (confirmed via empty `pg_policies` result).
3. Effective privileges via `has_table_privilege()`: `anon_update: false`, `authenticated_update: false`, `service_role_update: true`.
4. No residual column-level UPDATE privileges for `anon`/`authenticated` (confirmed empty `information_schema.column_privileges` result).
5. Live `accept_trip_invite()` definition contains `and accepted_at is null` in the gate; rest of the function body matches the drafted migration exactly.
6. Status breakdown post-migration: `accepted: 32, declined: 3, expired: 4, revoked: 2` — zero `pending` rows remain, which is the invariant that mattered (not an exact match to any prior snapshot, though it happened to also match one).
7. `decline_trip_invite()` and `revoke_trip_invite()` definitions confirmed byte-identical to their pre-migration versions — untouched, as intended.

### QA suite (9/9, disposable production test data, cleaned up afterward)

Run via a disposable script (deleted after use, never committed, same pattern as every other QA script in this engagement): fresh `@example.com` test accounts, real anon-key sessions for every authorization check, service-role reserved for preflight and confirmed cleanup only (with one narrow exception below).

| Check | Result |
|---|---|
| 1a — Invitee can no longer directly UPDATE her own pending invite | PASS |
| 1b — Owner can no longer directly UPDATE any invite (RPCs are the only path now) | PASS |
| 2 — Normal accept flow still succeeds | PASS |
| 2b — Accepted invitee is an active editor collaborator | PASS |
| 3 — Decline flow still succeeds | PASS |
| 3b — Declined invite shows `status='declined'` | PASS |
| 4 — Revoke flow still succeeds | PASS |
| 4b — Revoked invite shows `status='revoked'` | PASS |
| 5 — Replay defense on a tampered invite is rejected | PASS |

Check 5 is the key new coverage for the hardening in step 4 above: service-role was used to construct an artificial "already-tampered" fixture — an invite that had been legitimately accepted in check 2, then had its `status` reset to `'pending'` while deliberately leaving `accepted_at` set (simulating a careful attacker who resets status but doesn't think to clear the timestamp too). The invitee's own session then called `accept_trip_invite()` again and was correctly rejected with "Invite not found or is not pending." This is the one place service-role was used to construct state rather than only to preflight/clean up — narrowly justified because no legitimate anon-key flow can produce a "tampered" row to test against.

Cleanup confirmed via admin read-back (not just "no error" from the delete calls): test trip and all three disposable accounts (owner, accepting invitee, declining invitee) confirmed absent afterward.

## Historical limitation — read this before treating this arc as closing more than it does

This migration prevents **future** exploitation of all three paths. It does **not** and cannot prove that no unauthorized collaborator was ever created in the past via trip-scope manipulation or replay, before this fix shipped. The aggregate-only pre-fix checks (above) found no positive evidence of exploitation, but were explicitly not conclusive — a sufficiently careful attacker's traces would not have shown up in those signals. A dedicated review of existing collaborator/invite provenance would be needed to make any claim about the past; that review has not been done and is explicitly out of scope for this remediation arc (see "What's still open" below).

## What's still open

- **Resolved separately**: a review of existing `trip_collaborators`/`trip_invites` rows for provenance consistent with past exploitation of the paths described above (see "Historical limitation") has been completed — see [D7_TRIP_INVITES_HISTORICAL_PROVENANCE_REVIEW.md](./D7_TRIP_INVITES_HISTORICAL_PROVENANCE_REVIEW.md).
- **Resolved separately**: D2 (the public `journal-images` storage bucket undermining the app's private-visibility model) was remediated and production-verified; see [D2_JOURNAL_IMAGE_STORAGE_REMEDIATION.md](./D2_JOURNAL_IMAGE_STORAGE_REMEDIATION.md).
- **Resolved separately**: `supabase/reference/` (D7 evidence snapshot) is now tracked and reframed as historical audit evidence, with its README documenting the areas superseded since capture.
- Any other findings from the original D7 audit not explicitly addressed here or in [D7_ACTIVE_COLLABORATOR_REMEDIATION.md](./D7_ACTIVE_COLLABORATOR_REMEDIATION.md) remain outstanding.
