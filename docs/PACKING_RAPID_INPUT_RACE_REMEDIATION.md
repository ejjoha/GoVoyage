# Packing Toggle/Quantity Rapid-Input Race — Remediation

**Status: complete.**

## What was found

Flagged during an earlier duplicate-submission sweep as a lower-priority state-consistency issue, distinct from [D4's offline-sync work](./D4_PACKING_OFFLINE_SYNC_REMEDIATION.md): rapid, same-control double-taps on a packing item's toggle or quantity buttons could silently lose one tap's intent, leaving the displayed (and persisted) state inconsistent with what the user actually did.

Root cause, confirmed by literal code inspection and a deterministic reproduction harness before any fix was written: `handleToggleItem`, `onIncreaseQuantity`, and `onDecreaseQuantity` in `packing-board.tsx` each computed their next value (`nextPacked = !item.packed`, `nextQuantity = item.quantity ± 1`) from the `item` function parameter — whatever `PackingItemRow`'s `onClick` closure had captured at the component's last render. Two synchronous invocations in the same call stack (a real double-tap, or two taps close enough that React hasn't re-rendered between them) both receive the identical `item` reference and therefore compute the identical "next" value from the identical stale base. A double toggle from unpacked recomputed `!false → true` twice instead of toggling back to `false`; a double `+` recomputed `1+1` twice instead of reaching `3`.

This is upstream of, and structurally distinct from, D4's queue/mutation architecture. D4 makes each individual mutation reliable once it's created (single-flight, same-item collapse, fresh-ID preflight, fail-closed reconciliation); it has no visibility into how a mutation's *value* was computed in the React layer before it ever reaches the queue. The bug lived entirely in that upstream layer — one incorrect value could be queued, synced, and reconciled by D4 with complete fidelity, and the result would still be wrong, because D4 was faithfully applying the wrong intent.

The functional-updater form of `setItemsByList((current) => updateItemInList(current, ...))` was not itself the problem — `current` was always correctly threaded through to `updateItemInList`. The defect was one line earlier, before `setItemsByList` was even called.

## The fix

`usePackingData()` (`features/packing/hooks/use-packing-data.ts`) now owns a ref (`itemsByListRef`) that mirrors `itemsByList` synchronously, ahead of React's own commit. It is kept private to the hook — nothing outside `use-packing-data.ts` ever touches the ref directly.

A single wrapper replaces the raw `useState` setter as `setItemsByList`: every write (function updater or plain value) is resolved against `itemsByListRef.current`, the ref is updated, and only then is the real state setter called. Because this wrapper is the *only* thing exported under the name `setItemsByList` — including to the three call sites that live inside the hook itself (initial cache load, server load, and the D4 reconciliation subscription) — every one of the 13 places that write `itemsByList` stays synchronized automatically, with no per-call-site opt-in and no way for a future write site to forget.

The hook exposes one new accessor, `getLatestItem(listId, itemId)`, instead of the ref itself — closing over the private ref rather than handing it out. `handleToggleItem`, `onIncreaseQuantity`, and `onDecreaseQuantity` in `packing-board.tsx` now call `getLatestItem(...)` to read the true latest packed/quantity value before computing next-value, instead of trusting the `item` parameter. If the lookup finds nothing (e.g. the item was deleted or hidden between the click and this read), the handler no-ops cleanly rather than acting on `undefined`.

`packing-state.ts` gained one new pure helper, `getItemFromList`, matching the file's existing `(itemsByList, ...) → result` shape — no restructuring of the file beyond that addition.

Two properties fall out of this shape without extra code: unrelated fields (sync-adjacent or otherwise — `packed_by`, `notes`, `sort_order`, etc.) are untouched, because `updateItemInList`'s merge only ever overwrites the specific fields in the `update` object being written; and `packed_at` can't be touched by a quantity-only change, because the quantity handlers' `update` object never includes it.

### Files touched

- `features/packing/hooks/use-packing-data.ts` — private ref, centralized `setItemsByList` wrapper, `getLatestItem` accessor added to the hook's return value.
- `features/packing/components/packing-board.tsx` — the three toggle/quantity handlers read `getLatestItem(...)` instead of the `item` parameter, with a not-found no-op guard.
- `features/packing/lib/packing-state.ts` — one new pure function, `getItemFromList`.

**D4's queue/sync/reconciliation code was not touched.** `packing-sync-queue.ts`, `packing-offline-service.ts`, and `packing-mutations.ts` are untouched by this diff — confirmed by the diff itself (three files changed, none of them D4's) and by the merge's file list below.

## QA evidence

### Deterministic harness (disposable, not committed, never touched real Supabase)

Built against the real, unmodified `updateItemInList`/`getItemFromList` from production `packing-state.ts`, with a `setState`-queue shim faithfully matching React's batching semantics. Each of the current handler bodies was copied verbatim and exercised by calling it twice, synchronously, in one call stack — matching a real double-tap exactly.

| Case | Expected | Unfixed (before) | Fixed (after) |
|---|---|---|---|
| Double toggle from unpacked | `false` | `true` — BUG | `false` — FIXED |
| Double `+` from quantity 1 | `3` | `2` — BUG | `3` — FIXED |
| Double `-` from quantity 3 | `1` | `2` — BUG | `1` — FIXED |
| Double `-` from quantity 2 (strengthened boundary case) | 1st call → qty 1, no remove-confirm; 2nd call → remove-confirm fires exactly once, reading the *latest* qty (1, not stale 2), zero further decrement writes | not independently verified pre-fix (final-number-only check is a known-insufficient proxy here) | all sub-assertions passed: qty 1 after 1st call, 0 remove-confirm calls after 1st, qty unchanged + exactly 1 remove-confirm call (with the correct latest item) after 2nd, exactly 1 total decrement write |
| Not-found guard (item removed before handler runs) | clean no-op, no throw, no state write | n/a (guard didn't exist) | no throw, no state write — PASS |
| Single click, all three handlers | unchanged from pre-fix behavior | n/a | toggle → `true`, `+` → `2`, `-` → `2` — all OK |

The quantity-2 case was deliberately strengthened beyond a final-value check: a correct fix and an incompletely-fixed one can coincidentally land on the same final number there (the `Math.max(1, ...)` floor masks it), so the assertion instead checks that the remove-confirmation path fires exactly once, with the correct latest item, and that no spurious decrement write happens on the second call.

### Mounted-app QA — 5/5, live against production Supabase

Run through the actual component/hook wiring (not the harness): dev server on `fix/packing-rapid-input-consistency` at `c38f625`, pointed at `.env.local` (production Supabase), against a disposable trip/list/item and a disposable test account created for this session. Each test case's real double-stack interaction was driven live in the browser, with the resulting database state independently confirmed by direct query, not inferred from the UI alone.

| # | Case | UI result | DB result |
|---|---|---|---|
| 1 | Double toggle | ended unpacked | `packed: false` |
| 2 | Double `+` from 1 | showed `3` | `quantity: 3` |
| 3 | Double `-` from 3 | showed `1` | `quantity: 1` |
| 4 | Boundary: `2 → 1 →` remove-confirmation | confirmation dialog opened on the second same-stack invocation | `quantity` remained `1` throughout; item still existed; "Keep It" preserved it |
| 5 | Mixed toggle + quantity | showed quantity `2`, packed | `quantity: 2`, `packed: true`, with `packed_at`/`packed_by` correctly populated |

All fixture data (disposable trip, packing list, item, and test auth account) has been confirmed removed from production via a fresh service-role read-back — all four lookups returned nothing.

### Old-vs-new side-by-side, live production

The same double-toggle interaction was run against current, unmodified production code as a baseline: it reproduced the original bug (ended up `packed: true`, incorrect). The identical action on this fixed branch correctly ended up `packed: false`. Direct, real-time confirmation that the fix — not an unrelated environment difference — is what changes the outcome.

## What's still open

Nothing outstanding for this specific race. Other findings from the original duplicate-submission sweep not covered here remain tracked separately.
