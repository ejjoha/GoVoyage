# D7 — Trip-Invites Historical Provenance Review

**Status: complete.**

## The original question

`20260817154212_fix_trip_invites_update_authorization.sql` (see [D7_TRIP_INVITES_UPDATE_AUTHORIZATION_REMEDIATION.md](./D7_TRIP_INVITES_UPDATE_AUTHORIZATION_REMEDIATION.md)) closed a direct-`UPDATE` authorization gap on `trip_invites` that had two theoretically exploitable paths: **trip-scope manipulation** (an invitee redirecting their own pending invite's `trip_id` to an arbitrary trip and self-accepting as editor there) and **self-reinstatement** (a removed collaborator resetting their own already-accepted invite back to `pending` and re-accepting to bypass `remove_trip_collaborator()`/`leave_trip()`). That remediation explicitly could not and did not claim anything about the past — it closed the door going forward. This review's question was narrower and retrospective: **given what production actually retained, can we tell whether either path was ever exploited historically, and if not conclusively, what can we say?**

## Phase 1 — the evidentiary ceiling

A read-only capability inventory of `trip_collaborators`, `trip_invites`, `trips`, `trip_members`, `trip_activity_log`, and `trip_ownership_transfers` established what the database is even capable of proving, before any anomaly search began.

**Key structural facts:**
- `trip_collaborators` has a `UNIQUE (trip_id, user_id)` constraint — only one
  surviving row for a given pair can exist at a time. Normal reactivation via
  `accept_trip_invite()` therefore updates the existing row through
  `ON CONFLICT ... DO UPDATE`. However, the live direct hard-`DELETE` paths can
  erase that row entirely; after such a delete, the same pair can later be
  inserted as a fresh row with a new `created_at`, with no surviving indication
  that an earlier row ever existed.
- No `updated_at` exists on `trip_collaborators` or `trip_invites`. `removed_at` is a single slot, silently reset to `null` on every reactivation. `trip_invites` has no `revoked_at`/`declined_at`/`expired_at` at all — only `accepted_at`.
- Zero triggers exist on any of the six tables. All state transitions happen either through six `SECURITY DEFINER` functions or through **direct client writes RLS still permits**: a trip owner can hard-`DELETE` any `trip_collaborators` row, a collaborator can hard-`DELETE` their own, a trip owner can `INSERT` a `trip_collaborators` row directly (bypassing the invite flow entirely), and equivalent direct `DELETE`/`INSERT`/`UPDATE` policies exist on `trip_members`. None of these paths are used by current app code (confirmed via full codebase search), but none are blocked at the database level either.
- `trip_activity_log` is the only append-only event table (`INSERT`/`SELECT` policies only, no `UPDATE`/`DELETE` policy for any role) — but its `INSERT` policy doesn't constrain `event_type`, `target_id`, or `metadata` content, so it is tamper-*resistant* after the fact but not self-*authenticating* at write time.
- No production-queryable timestamp exists for exactly when `20260817154212` was applied — `supabase_migrations.schema_migrations` has no applied-at column, and no DDL event trigger logs schema-change times. The migration's version string (2026-08-17 15:42:12 UTC) is a lower bound only — file creation, not necessarily push time.

## Key historical blind spots (carried into Phase 2's interpretation)

1. **Hard-delete paths leave zero trace.** A removal or reinstatement performed via the direct `DELETE`/`INSERT` RLS paths (rather than the logging RPCs) produces no `trip_activity_log` entry and, after a delete, a fresh row indistinguishable from "never a collaborator here before."
2. **A successful pre-fix trip-scope tamper would be internally self-consistent.** `accept_trip_invite()` reads `trip_id` fresh off the invite row at accept time and uses that same value for both the `trip_collaborators` insert and the activity-log entry — so a tampered invite, once accepted, produces an invite/event/collaborator chain that all agree with each other. The invite's *original* `trip_id` is never retained anywhere once overwritten.
3. **Row `created_at` reflects the surviving row's history only.** A hard `DELETE` followed by a fresh `INSERT` for the same pair looks identical to a first-time relationship — same shape, no distinguishing marker.
4. **Timestamp classification around the fix is inherently fuzzy.** Events before 2026-08-17 15:42:12 UTC are definitely pre-migration-file; events after are not automatically post-fix, only after the file's creation — the actual production push happened later the same session, with no independently queryable confirmation of exactly when.

## Phase 2 — aggregate results

### Trip-scope manipulation

All 23 surviving `trip_collaborators` rows were reconciled against accepted invites (matched by email, same trip) and `invite_accepted` activity events (matched by actor/trip):

| Bucket | Inactive | Active | Total |
|---|---|---|---|
| Clean accept (accepted invite + matching event, same trip) | 3 | 8 | 11 |
| Accepted invite, no matching event | 5 | 6 | 11 |
| Event, no matching invite | 0 | 0 | 0 |
| Neither invite nor event | 0 | 1 | 1 |

The 11-row "accepted invite, no matching event" bucket was reconciled against the activity log's own coverage window: the earliest surviving `invite_accepted` event in production is 2026-06-14 21:14:33 UTC, and all 11 rows' matched invites were accepted before that instant — **consistent with the pre-logging coverage gap; no anomaly identified.** (The earliest surviving event marks where logged history begins, not a proven date for when the logging code was introduced — this is a boundary on what the log can attest to, not a dated fact about the codebase.)

The single "neither invite nor event" row was cross-checked against removal history (none found) and is consistent with the legitimate direct-owner-`INSERT` path that RLS has always permitted — not flagged in isolation, per the review's own design (a collaborator with no invite is not itself anomalous).

**Event-integrity and cross-trip checks, across all 14 `invite_accepted` events:**
- Event `target_id` resolving to no real invite: **0**
- Target invite's `trip_id` ≠ the event's own `trip_id`: **0**
- Target invite's status ≠ `accepted`: **0**
- Same actor gaining a `trip_collaborators` row on a *different* trip within 5 minutes of an accept event (the trip-hopping signature): **0 of 14**

### Self-reinstatement

| Bucket | Count |
|---|---|
| Currently inactive, removal evidence present | 8 |
| Explained historical reactivation (removal evidence + later corroborating accept) | 2 |
| Unexplained apparent reactivation | **0** |
| Currently active, no logged removal history (indeterminate) | 13 |

8 + 2 + 13 = 23, consistent with the full population. Every `collaborator_removed` event's `metadata.target_user_id` corroborated the reconstructed collaborator's identity — 100% match, no corroboration failures.

### The 14 → 11 event reconciliation

All 14 `invite_accepted` events were grouped by (trip_id, actor_user_id): **11 distinct pairs** — 9 pairs with exactly 1 event, 1 pair with 2, 1 pair with 3. 9×1 + 1×2 + 1×3 = 14, fully accounted for. Every one of the 11 pairs has a surviving `trip_collaborators` row today (0 orphaned accept events).

The two multi-event pairs produce 3 consecutive-accept gaps; 2 were explained by an intervening `collaborator_removed`/`collaborator_left` event. One was not, and was examined at row level (trip id, collaborator id, and an opaque actor UUID only — no name, email, or other PII):

**One pair had three accepted invites within approximately 37 minutes.** The first-to-second acceptance interval contains a logged `collaborator_left` event and is therefore an explained reactivation. The second-to-third interval contains no removal event, but no removal was required: the collaborator was already active and a separate pending invite was accepted, making the subsequent upsert effectively a no-op reactivation. The clustered timing is compatible with ordinary repeated testing/use of the invite flow, but intent cannot be established from the retained data.

(The first of the three accepts — 2026-06-14 21:14:33.920673 UTC — is, exactly, the earliest `invite_accepted` event ever logged in production; this pair's history begins at the same instant the log's own coverage begins. The actor was confirmed *not* to be the trip's owner; their current role is `editor`.)

## Final conclusion

No surviving evidence consistent with historical trip-scope manipulation or unexplained collaborator self-reinstatement was found. All 23 surviving trip_collaborators rows were reconciled against accepted invites, activity-log events, and removal history. No invite/event trip mismatch, invalid acceptance target, cross-trip acceptance signature, or unexplained removal→reactivation sequence was identified.

This does not establish that exploitation never occurred. Historical direct DELETE/INSERT paths could erase collaborator history without producing activity-log evidence, and a successful pre-fix modification of an invite's trip_id could leave an internally consistent post-tamper invite/event/collaborator chain because the original trip ID was not retained. The result therefore establishes absence of detectable evidence in the surviving data, not proof of non-exploitation.

## Audit trail — exact numbers

- **23** collaborator rows examined
- **11** clean/current accepted-invite+event relationships
- **11** accepted-invite relationships predating the surviving logging boundary
- **1** relationship with neither invite nor event, consistent with the legitimate direct-owner INSERT path
- **14** invite_accepted events → **11** distinct trip/user pairs
- **0** event targets missing invites; **0** event/invite trip mismatches; **0** acceptance events pointing at non-accepted invites; **0** cross-trip timing signatures
- **8** currently inactive relationships with removal evidence
- **2** explained historical reactivations
- **0** unexplained apparent reactivations
- **13** currently active relationships with no logged removal history — historically indeterminate, not proven continuous
