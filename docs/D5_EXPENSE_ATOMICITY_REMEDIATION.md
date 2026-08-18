# D5 — Expense/Participant Write Atomicity Remediation

**Status: complete.**

## What was found

The original health audit (`docs/AUDIT_2026-08.md`, finding D5) flagged that `updateExpense()` (`app/trips/[id]/cost-sharing/api.ts`) was not transactional: it performed three sequential, independent network calls — `expenses.update()`, then `expense_participants.delete()` for that expense, then `expense_participants.insert()` for the new participant set — with nothing wrapping them and no compensation for a failure partway through. If the delete succeeded and the insert then failed (network error, RLS denial, constraint violation), the expense was left with its new amount/currency but **zero participants**. Downstream, `calculateGroupedSummary()` silently skips zero-participant expenses when computing per-person balances, while `totalCostByCurrency()` does not — so the displayed total and the displayed balances desynced, a real money-integrity bug in a cost-sharing feature.

`createExpense()` had a related but meaningfully narrower exposure. It also chained two sequential calls (insert expense, then insert participants), but it compensated for a failed participant insert by deleting the just-created expense — rolling back to a clean "nothing created" state. That compensation was itself a third unguarded network call, so a second failure (the compensating delete also failing) would reproduce the same zero-participant orphan, and there was a brief transient window between the participant-insert failure and the compensating delete completing where a concurrent reader could see the orphaned expense. But this required two consecutive failures, not one — `updateExpense()`'s exposure was a single-failure, persistent bug; `createExpense()`'s was a double-failure, self-healing-once-resolved one.

This work also closed a separate, related gap found during the same investigation: `handleSaveExpense()` (`app/trips/[id]/cost-sharing/page.tsx`) had `isSavingExpense` state and a `disabled` button, but was missing the synchronous `useRef` lock that closes the remaining double-submission race window — the same pattern already fixed for bookings, add-traveller, and packing list reset/delete earlier this week. That fix (`saveExpenseLockRef`, checked and set before any async work, released in a `finally` block) shipped in the same branch as this atomicity work.

## Remediation

Both `createExpense()` and `updateExpense()` now call a single `SECURITY DEFINER` Postgres RPC each — `create_expense_with_participants()` and `update_expense_with_participants()` — instead of making direct table calls. All statements inside a `plpgsql` function body execute in the same transaction as the RPC call itself: if any statement raises, everything the function did rolls back automatically, including statements that "succeeded" moments earlier in the same call. This is the same guarantee `create_trip_with_owner()` and `transfer_trip_ownership()` already relied on elsewhere in this schema — not a new pattern introduced for this fix.

### Authorization model

`expenses` and `expense_participants`' RLS policies all key off the identical predicate (`user_can_access_trip(trip_id)` directly, or via an `EXISTS` join to `expenses.trip_id`) — confirmed via a live `pg_policies` read before drafting the migration, not assumed. That symmetry is why the prior client-side `.insert(...).select()` calls were never at risk of the D1-class RETURNING/SELECT-policy mismatch found earlier this engagement. But a `SECURITY DEFINER` function bypasses RLS entirely for its own internal writes, so RLS isn't doing the authorization work here — each function performs its own explicit `user_can_access_trip()` check before mutating anything, using `IS TRUE` / `IS NOT TRUE` rather than a bare boolean condition, since a `NULL` result from that check must fail closed rather than silently pass.

**Update's authorization is deliberately not caller-suppliable.** `trip_id` is not a parameter of `update_expense_with_participants()`. If it were, a caller could supply an `expense_id` belonging to a trip they can't access alongside a `trip_id` for a trip they can access, and the authorization check would pass against the wrong trip entirely. Instead, the function looks up the target expense first and derives its actual, current `trip_id` from that row — the only value ever checked or trusted. The existence check, the access check, and a row lock are combined into a single `SELECT ... FOR UPDATE`: a nonexistent `expense_id` and an inaccessible one both fail with the identical "Expense not found or access denied" exception, so the error itself doesn't leak which case occurred, and there's no window between checking access and locking the row for a concurrent change to slip in.

`create_expense_with_participants()` has no existing row to derive a trip from, so the caller supplies the target trip directly, and it's authorized before anything is inserted.

### Participant and payer validation

Both functions reject an empty or null participant array before any mutation — without this, the RPC could be called directly (bypassing the app's own form validation) to intentionally produce the exact zero-participant state this remediation exists to prevent. Both also verify that the payer and every participant actually belong to the authoritative trip (the derived `v_trip_id` on update, the caller-supplied `p_trip_id` on create) — not merely that the caller can access the trip. This check deliberately has no `active = true` filter on `trip_members`: historical expenses may legitimately reference travellers later archived, and nothing about this remediation should change who a past expense is allowed to reference.

### No exception handling

Neither function catches or suppresses errors anywhere in its body. An unhandled error already aborts and rolls back the whole call — exactly the guarantee this migration exists to provide. Swallowing an error here would defeat the fix.

## Production verification

**Structural checks** (read-only, against the live functions):
- Both `update_expense_with_participants` and `create_expense_with_participants` exist, `SECURITY DEFINER`, owned by `postgres`
- Both have `search_path` set to empty (`search_path=""`), with every reference schema-qualified (`public.expenses`, `public.expense_participants`, `public.user_can_access_trip(...)`) throughout
- `update_expense_with_participants`'s argument list contains no `p_trip_id`; `create_expense_with_participants`'s does
- `proacl` for both: `{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}` — no `PUBLIC` entry, no `anon` entry
- `has_function_privilege('anon', ..., 'EXECUTE')` is `false` and `has_function_privilege('authenticated', ..., 'EXECUTE')` is `true` for both

**Behavioral QA — 17/17 checks passed** (disposable production test data, confirmed cleaned up via admin read-back afterward):

| Check | Result |
|---|---|
| Happy-path create; fields/participants match request | PASS |
| Happy-path update; fields/participants match request | PASS |
| Update with a duplicated participant id rejected (unique-constraint violation); expense fields **and** participant rows completely unchanged afterward | PASS |
| Create with a duplicated participant id rejected; zero orphaned expense rows survive | PASS |
| Create with an empty participant array rejected | PASS |
| Update with an empty participant array rejected; original state unchanged | PASS |
| Create with a payer belonging to a different trip rejected | PASS |
| Create with a participant belonging to a different trip rejected | PASS |
| A total outsider (no access to the trip at all) cannot update its expense; state unchanged | PASS |
| Update against a nonexistent expense id rejected | PASS |
| A non-owner **active editor collaborator** can successfully create an expense via the RPC | PASS |

The duplicate-participant rollback checks are the direct proof of the original bug's fix: the expense-field update and the participant-row replacement are read back and compared field-by-field (id, trip_id, title, amount, currency, expense_date, paid_by_member_id, sorted participant-id list) against their pre-attempt state, not merely "the RPC call returned an error." The positive collaborator-authorization check confirms the fix preserves the pre-existing model where any trip collaborator — not just the owner — can manage expenses, alongside proving a true outsider cannot.

## Explicit limitation — read this before assuming more than what was achieved

These RPCs make the **app's own** create/update paths atomic. The underlying `expenses` and `expense_participants` tables still carry their pre-existing direct-write RLS policies (`INSERT`/`UPDATE`/`DELETE`, all gated on `user_can_access_trip(trip_id)`), so a client bypassing these RPCs and writing to the tables directly could still reproduce the original zero-participant failure mode. Revoking those direct-write grants was considered during design and deliberately not done — it risks breaking anything else that may depend on them, and was out of scope for this fix. This remediation closes the gap in the paths the app actually uses; it is **not** a database-level guarantee that the zero-participant state is now structurally impossible.

## What's still open

- The pre-existing direct-write RLS paths on `expenses`/`expense_participants` remain live, per the limitation above — revisiting whether to revoke them is a separate, deliberately deferred decision.
- Other findings from the original health audit not addressed by this arc remain outstanding.
