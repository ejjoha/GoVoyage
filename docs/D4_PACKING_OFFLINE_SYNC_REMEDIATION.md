# D4 — Packing Offline-Sync Failure Handling Remediation

**Status: complete.**

## What the audit found, and what the investigation found underneath it

The original health audit's D4 finding was: packing's offline-mutation queue (`features/packing/lib/packing-sync-queue.ts`) treated any sync failure — a network error or a permanent application error — identically, re-queuing it indefinitely with no visible indication to the user (`getPendingPackingMutationCount()` existed but had zero call sites anywhere in the app).

A dedicated investigation (traced against the live code and the live schema, not assumed from the audit's description) confirmed that finding but surfaced a more serious problem underneath it. None of the three offline-aware mutation functions (`togglePackedItem`, `updatePackingItemQuantity`, `hidePackingItem`) called `.select()` on their `UPDATE` — and the RLS policies for `packing_list_items` (`SELECT` and `UPDATE` confirmed, via a direct `pg_policy` comparison, to share the *identical* `user_can_access_trip(trip_id)` predicate — no D1-class asymmetry) mean a plain `.update().eq("id", itemId)` with no `.select()` returns `{ error: null }` even when **zero rows match** — whether because the item row no longer existed, or because the user had lost trip access. Both of those genuinely-permanent situations never threw at all; they masqueraded as success. The mutation would be removed from the queue as "synced" while the local optimistic state silently diverged from server truth, with no error ever surfacing to classify — a quieter and more dangerous version of the audit's "retries forever" framing, since it doesn't even produce the "stuck" symptom the audit described.

A second, independently significant problem was found during design review of the fix itself: the existing code had a direct online-write bypass (`if (navigator.onLine) { await serverMutation(); } else { enqueue(); }`), meaning there were two separate paths to the server. An in-flight direct write for a stale value could still land on the server *after* a newer edit had already superseded it in the local queue — the same class of race D3 closed for the itinerary hook, but reachable here through a different door.

## Remediation

### Unified queue, no direct-write bypass

Every packing mutation — online or offline — now goes through exactly one path: optimistic update → synchronous enqueue (existing same-type/same-item collapse applies immediately) → if offline, stop; if online, request a sync. `togglePackedItem`/`updatePackingItemQuantity`/`hidePackingItem` are called from exactly one place in the app: the sync worker's write-attempt pass. Combined with strict single-flight and sequential per-item processing (below), this closes the in-flight-write race structurally: a superseding edit's write can only ever be sent to the server *after* the write it superseded has already resolved, never concurrently.

### Four outcomes, not two

`.select("id")` was added to all three mutation functions (proven safe against the live RLS policies before writing any code) so a write's result is now distinguishable into four outcomes, not the original binary:

- **Applied** — one row returned. Mutation removed from the queue.
- **Retryable-bounded** — a transport/network failure, *or* any coded Postgres/PostgREST error outside a narrow deterministic whitelist (connection pressure, cancellation, resource limits, and similar can all be transient — lumping "has an error code" with "therefore permanent" was rejected during design as too aggressive). Bounded at 5 attempts (`MAX_WRITE_ATTEMPTS`).
- **Deterministic** — only Postgres' `22xxx` (data exception / malformed input) class. Constraint violations (`23xxx`) were deliberately excluded from this bucket — a foreign-key or unique violation can become valid later if the referenced/competing row's state changes, so they're treated as retryable-bounded instead.
- **Zero-row** — the write call succeeded but matched no row.

### Zero-row is a two-stage reconciliation, never an instant verdict

Zero-row, retry-exhaustion, and a deterministic error all route into the same intermediate state — `"reconciling"` — rather than any of them jumping straight to a final answer. A mutation in this state is never replayed as a write again. Instead, the worker fetches the trip's authoritative packing data and compares only the single field the mutation actually owns (`packed` for a toggle, `quantity` for a quantity change, presence/absence for a hide — never the whole row) against the mutation's intent:

- If the fetch itself fails, the mutation stays `"reconciling"` untouched, retried on the next trigger — this is a read, safe to retry indefinitely, unlike a write.
- If the fetch succeeds and the server value already matches what was intended, the mutation resolves as applied and is removed — covers the case where the write actually landed and only the *response* was lost.
- If it succeeds and the value doesn't match, the mutation becomes `"failed"` with an honest, specific message (e.g. *"This change could not be applied because the item is no longer available in the current packing list."* for an absent item — deliberately not worded as "deleted," since absence can't be distinguished from other causes) and is never retried again.

Critically, exhausted retries and deterministic errors get this same one-shot reconciliation check before ever becoming `"failed"` — we don't actually know, when a transport failure exhausts its retry budget, whether the write silently succeeded and only the acknowledgment was lost. Skipping straight to "failed" without checking would itself risk telling the user their change was lost when it wasn't.

Reconciliation's result is persisted to the same `packing-cache-<tripId>` entry the normal load path reads from (`persistReconciledSnapshot`), not just pushed into React state — a correction that only lives in memory would let a stale, already-disproven optimistic value reappear from cache after an offline reload.

### The D3 persistence principle, applied here too

The single most structurally important fix: no asynchronous packing operation ever writes back a whole-queue snapshot captured before an `await`. A single primitive, `applyMutationOutcome(mutationId, resolve)`, rereads storage fresh and mutates only the one mutation whose outcome was just learned; if that id is no longer present (superseded by a newer edit, or already resolved by a concurrent pass), it's a deliberate no-op — fail-closed, the same invariant the itinerary conflict-recovery fix established. This replaced the original sync loop's pattern of accumulating a `remaining` array across the whole pass and writing it back once at the end, which — once the online-direct-write bypass was removed and mutations could arrive mid-pass — would otherwise have silently dropped a newly-enqueued mutation.

### Multi-pass, same-invocation scheduler

`syncPendingPackingMutations()` is single-flighted (`inFlightSync`): a caller arriving mid-run sets a `syncRequestedWhileRunning` flag and awaits the same in-flight promise rather than starting a second overlapping worker. The worker loops (`do...while`) until a full pass completes with nothing new requested. Every transition *into* `"reconciling"` — zero-row, deterministic error, or exhausted retries — explicitly sets that dirty flag itself, so the mutation is picked up for reconciliation within the same invocation rather than waiting on some future external trigger that might never come for an already-online user. `attemptedWriteIds`/`attemptedReconcileIds` are tracked per mutation id (not per trip) within a single invocation, so a second item on the same trip transitioning into `"reconciling"` mid-run still gets resolved by that run rather than being skipped because the trip was already "used." A fresh-ID preflight runs immediately before every write attempt, and the queue is reread immediately before building reconciliation's pending-mutation overlay — both guard against the same class of stale-snapshot bug the persistence principle above exists to prevent.

### Sync-on-mount, and live reconciliation feed

Reopening the app already online no longer requires a future `online` transition to drain a pending queue — `usePackingData`'s mount effect now calls `syncPendingPackingMutations()` before its first fetch, in addition to the pre-existing `online` listener. A small pub/sub (`onPackingReconciled`) lets a mounted component receive a corrected snapshot live, mid-session, rather than only on the next full reload.

### Trip-scoped status, kept fresh without stale reads

`getPackingMutationStatusCounts(tripId)` returns `{ pending, reconciling, failed }` scoped to one trip — an earlier unscoped version was caught in review before shipping, which would have shown Trip A's stuck mutations in Trip B's header. `getPendingPackingMutationCount()` (the pre-existing, previously-uncalled function) was left with its original unscoped shape and name, so no existing or future caller silently gets a different return type. A second, deliberately separate subscription (`onPackingQueueChanged`, fired on every persisted queue write) lets the UI recompute counts after an *ordinary* successful background sync too — one that never touches reconciliation at all and so would otherwise never trigger a refresh.

## What the UI actually shows — explicitly scoped

D4 ships a **trip-level** indicator only: a header line reading e.g. "2 changes not yet synced" / "1 change could not be applied," aggregated across all of a trip's pending/reconciling/failed mutations. **Per-item inline failure badges were part of the originally-discussed design and were intentionally deferred** — wiring one would mean threading mutation status down through `PackingListCard` → `PackingCategorySection` → the individual item row, none of which were touched or reviewed in this arc. The trip-level indicator is sufficient to close the audit's core "silent, invisible divergence" finding — a stuck or failed change is now always visible somewhere on the page — but it does not yet identify *which specific item* is affected without opening the queue directly. Whether that becomes its own follow-up is a separate decision.

## Production verification — 6/6 scenarios passed

A disposable fixture set (one owner account, Trip A with 7 packing items covering scenarios 1–5, Trip B with 1 item for scenario 6) was provisioned and torn down via a dedicated QA script (production-ref guard; service-role reserved for disposable account provisioning and fixture teardown/read-back, including best-effort rollback if setup failed; all behavioral test actions used authenticated/RLS-governed clients — confirmed via a direct `pg_policy` read that `packing_list_items`' `DELETE` policy grants `authenticated`, so the zero-row scenarios could hard-delete a target item through the owner's own real session rather than needing a service-role fallback).

| # | Scenario | Method | Result |
|---|---|---|---|
| 1 | Happy path | Offline edit (console `navigator.onLine` override, the technique proven reliable during D3 after DevTools throttling/Request Blocking both proved unreliable) → reconnect → sync. Then a second, already-online toggle-back as a baseline check of the newly-unified write path. | PASS — queue empties, no lingering indicator, both the offline→online and plain-online paths confirmed clean. |
| 2 | Reconciliation / zero-row | Item queued offline; hard-deleted for real via the owner's own authenticated session (not service-role) while queued; reconnected. | PASS — mutation resolved to `"failed"` with the accurate "no longer available" message; item disappeared from the UI via the persisted cache correction, not just in-memory state. |
| 3 | Supersession during an in-flight write | A console `fetch` interceptor delayed exactly one in-flight `PATCH` to the target item by 30 seconds (proven to actually intercept the real request via a one-shot logger before relying on it); a second edit to the same item was made ~2 seconds after the first, well inside the delay window, before the first's delayed response resolved. | PASS — **confirmed by direct database query**: the item's final server state matched the *second* edit (`packed: false`), not the stale first write, with the fail-closed no-op on the superseded mutation id behaving exactly as designed. |
| 4 | Unrelated mutation survives a sibling's failure | Two items queued offline together; only one hard-deleted mid-flight. | PASS — **confirmed by direct database query**: the failing item resolved to `"failed"` while the unrelated item's server state showed `packed: true` with a fresh `updated_at`, matching the intended edit exactly — the aggregate indicator showed only the one genuine failure, not two. |
| 5 | Bounded retry exhaustion | A console `fetch` interceptor (matched on the PostgREST URL query string, `?id=eq.<itemId>`, not the request body — confirmed this is where PostgREST places the filter) rejected the target item's writes across repeated real trigger actions. | PASS — attempt count climbed one at a time per trigger rather than several at once within a single invocation, transitioning to `"reconciling"` on exhaustion exactly as designed, then resolving against real server truth rather than being left permanently optimistic. |
| 6 | Cross-trip status isolation | Trip A left with an active pending/failed mutation; Trip B's packing page opened in the same session. | PASS — Trip B's header showed no indicator at all; returning to Trip A showed its own indicator unchanged. |

Fixtures fully torn down afterward with admin read-back confirmation (items/lists/members/trip rows all at 0 for both trips, owner account confirmed gone via a genuine 404 — the verification itself was fixed during script review to fail closed rather than silently treat a verification error as "already deleted").

## What's still open

- Per-item failure identification in the UI (see above) — a real gap, deliberately out of this arc's scope.
- Other findings from the original health audit not addressed by this arc remain outstanding.
