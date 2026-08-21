# D3 — Offline Itinerary Conflict-Recovery Remediation

**Status: complete.**

## What was found

`useTripBookings.ts` (`app/trips/[id]/hooks/useTripBookings.ts`) implements an offline-first mutation queue for trip bookings: edits made while offline (or while `navigator.onLine` is `false`) are written to a `localStorage`-persisted array (`trip-booking-mutations-<tripId>`) and replayed sequentially against the server once online, using optimistic concurrency (`UPDATE ... WHERE id = X AND updated_at = baseUpdatedAt`). A zero-row match — someone else changed the booking in between — comes back from PostgREST as `{ data: null, error: null }` via `.maybeSingle()`, and the sync loop treats that `!data` signal as a conflict: it sets `syncStatus` to `"conflict"` and stops processing the queue, surfacing a banner with a "Refresh itinerary" action.

The bug was in what that action did. `refreshItineraryAfterConflict()` was:

```js
writePendingMutations([]);
setPendingMutationCount(0);
setSyncStatus("idle");
await fetchBookings();
```

This unconditionally wiped the **entire** pending-mutation queue, not just the one mutation that actually conflicted. If a second, unrelated booking edit was queued alongside the conflicting one — a routine case, not an edge case, since any offline session naturally accumulates several edits before reconnecting — clicking "Refresh itinerary" silently discarded that unrelated work along with the conflicting one. The user would see the conflict resolved and have no indication their other edit had also vanished.

## Remediation

`refreshItineraryAfterConflict()` now removes only the specific mutation that conflicted, identified by its `mutationId`, and resumes syncing whatever remains:

1. Capture `conflictingMutationId` (a new piece of state, set at the same moment `syncStatus` is set to `"conflict"` in both the `update_booking` and `delete_booking` branches of the sync loop) into a local variable **before** any `await` — so nothing that happens later in this function can change which mutation it's about to remove.
2. Fetch fresh server data first (`getBookings(tripId)`). If that fetch itself fails, stop immediately — the queue, including the still-conflicting mutation, is left completely untouched, and the user can retry "Refresh itinerary" again. Nothing is removed on a failed refresh.
3. Read the pending-mutations queue **fresh from `localStorage`**, not from a stale closure or component-state copy.
4. Filter out an **exact `mutationId` match only** — no fallback removal (e.g. "remove whatever's first," or "remove anything for that booking"). If the recorded conflict id isn't present in the fresh read, nothing is removed.
5. Persist the filtered queue only if something was actually removed.
6. Clear `conflictingMutationId`, set `syncStatus` back to `"idle"`, then call `syncPendingBookingMutations()` to resume processing whatever mutations remain.

### Fresh-queue fail-closed behavior

Step 4's "exact match or do nothing" design is deliberate, not incidental. The recorded conflict id can legitimately no longer be in the queue by the time `refreshItineraryAfterConflict()` runs — e.g. the user re-edits the same booking again while the conflict banner is showing, before clicking "Refresh." In that case the stale id must not fall back to removing *something else* (the newest mutation for that booking, the first item in the queue, etc.) — it must remove nothing. Any fallback here would reintroduce a narrower version of the original bug: silently discarding a mutation that was never confirmed to be the one that conflicted.

### Mutation-ID lifecycle invariant

The exact-match design is only safe because of an invariant traced through every write path in this file before implementation: **a mutation's `mutationId` is never reused across a supersession.** Every place a pending `update_booking` or `delete_booking` mutation for a given booking is replaced — re-editing the same booking, deleting a booking that already has a pending edit — filters out the old entry entirely and generates a brand-new id via `createMutationId()` for the replacement. The old id is never resurrected, and no code path ever writes a *new* mutation using a *previously used* id. This is what makes "the recorded conflict id is missing → do nothing" the correct behavior rather than a gap: if the id is gone, it's because the user's own subsequent edit already superseded it with a fresh id, and that fresh mutation deserves to be evaluated on its own next sync attempt, not swept up by a stale conflict resolution.

### Empty-queue edge case

The specific scenario this fix targets — one mutation (A) conflicts, one mutation (B) doesn't — ends with the queue going from `[A, B]` to `[B]` after the targeted removal, then to `[]` once B itself syncs successfully. The narrower single-conflict case (queue `[A]` → `[]` after removal, then `syncPendingBookingMutations()` called on an already-empty queue) was checked explicitly against the literal code rather than assumed: `syncPendingBookingMutations()`'s own empty-queue guard (`if (pendingMutations.length === 0) { setSyncStatus("synced"); setPendingMutationCount(0); return; }`) already handles this correctly — `pendingMutationCount` is explicitly reset to `0`, not left stuck at a stale value. No additional code was needed for this case.

## Verification

### Part B — algorithmic simulation (6/6 passed)

Because this fix lives inside a React hook using `useState`/`useCallback` and `localStorage`, with no test runner installed in this repo (no Jest/Vitest/Playwright config anywhere — confirmed during the original health audit), a disposable script (`qa-itinerary-conflict-recovery.mjs`, not committed) included a deliberately mechanical, line-for-line port of `refreshItineraryAfterConflict()`'s control flow — same steps, same order, same exact-match-only removal, same fail-closed-on-missing-id behavior — run against a matrix of scenarios:

| Check | Scenario | Result |
|---|---|---|
| B1 | A conflicts, B pending → refresh removes only A; B subsequently syncs | PASS |
| B2 | A conflicts, B and C both pending → both survive and sync | PASS |
| B3 | A conflicts; after refresh, B independently conflicts → A removed, B becomes the new conflict, B itself not lost | PASS |
| B4 | The refresh fetch itself fails → queue completely unchanged, conflict id not cleared | PASS |
| B5 | Recorded conflict id no longer present at recovery time → nothing removed, fail-closed | PASS |
| B6 | Mutation-ID lifecycle: conflicting id-1 superseded by a re-edit (id-2) before refresh → id-1 not resurrected or used as a fallback, id-2 survives and syncs | PASS |

This proves the **algorithm as specified** behaves correctly across the full matrix. It was explicitly not overstated as an "integration test" — it does not, on its own, prove the mounted React hook behaves the same way, since nothing in this repo can execute that hook outside a real browser.

A companion Part A (an isolated, disposable production proof that a stale `baseUpdatedAt` genuinely produces PostgREST's `{ data: null, error: null }` conflict signal, mirroring `updateBooking()`/`deleteBookingById()`'s exact query shape) was drafted and reviewed, but was intentionally **not run** — skipped as redundant once the real end-to-end test below produced direct, stronger evidence of the same signal firing correctly inside the actual app.

### Real end-to-end hook test (the primary evidence for this fix)

A genuine manual test was run against the mounted hook in a real browser, on the `fix/itinerary-conflict-targeted-removal` branch, dev server pointed at the real backend, using two real accounts (a trip owner and an active editor collaborator) in two separate browser sessions against disposable fixtures (a real trip with two real bookings). Chrome DevTools' Network-tab "Offline" throttle and Request Blocking were both tried first and found unreliable in this setup (the former triggered Chrome's native no-connection interstitial on an incidental navigation; the latter reported "0 affected" and let a real edit reach the server) — documented here for the record. The reliable technique that replaced them: overriding `navigator.onLine` directly via `Object.defineProperty(window.navigator, 'onLine', { configurable: true, get: () => false })` in the browser console. Since all three of the hook's connectivity checks (the sync loop's own guard, and the online-check in both `saveBookingOfflineFirst` and `deleteBookingOfflineFirst`) are plain `navigator.onLine` reads, this exercises the app's real production code path — real `createMutationId()`, real `baseUpdatedAt` capture, real payload shape — without touching the actual network stack, and without any risk of the browser's offline interstitial.

**Scenario 1 — conflicting edit:**
1. Booking A edited offline (owner session, `navigator.onLine` forced `false`) → mutation queued, correct `baseUpdatedAt` captured (checkpoint 1).
2. Collaborator (second session, genuinely online) edited Booking A differently and saved — applied immediately server-side.
3. Owner session flipped back online; sync triggered. Conflict detected on A's mutation, `syncStatus` → `"conflict"`, banner shown. Checkpoint 2b, taken **before** clicking "Refresh itinerary": A's mutation still fully present and unchanged in the queue — direct confirmation that conflict *detection* alone does not touch the queue.
4. After clicking "Refresh itinerary": sync succeeded, queue empty, Booking A shows the collaborator's server-side version — the existing "server wins" conflict-resolution semantics, unchanged by this fix.

**Scenario 2 — unrelated edit survives:**
1. Booking B edited offline in the same owner session (real "Saved offline" status shown) → queued correctly, no conflict for this booking.
2. Flipped back online; the app's `online` event listener was exercised directly and deterministically via `window.dispatchEvent(new Event('online'))` in the console (rather than relying on DevTools to fire a genuine browser event, which had proven unreliable).
3. B synced cleanly with no conflict — "itinerary synced" status shown, queue ended empty.

Together, these two scenarios are the direct proof this remediation exists to establish: **a conflict on one mutation only ever discards that one mutation** — a genuinely unrelated pending edit reaches the server successfully rather than becoming silent collateral damage, which is exactly what the original `writePendingMutations([])` blanket wipe would have destroyed.

## What's still open

- The `online` window-event-firing question raised during test setup (whether it fires reliably from real connectivity changes, separate from the DevTools-simulation unreliability documented above) was sidestepped by testing via direct `navigator.onLine` override and manual `dispatchEvent` rather than conclusively resolved. Not a blocker for this fix (the underlying recovery logic was proven directly), but worth revisiting if the app's reliance on that listener as its sole no-user-action resync trigger ever becomes suspect in production.
- Other findings from the original health audit not addressed by this arc remain outstanding.
