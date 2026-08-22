import {
    togglePackedItem,
    updatePackingItemQuantity,
    hidePackingItem,
} from "./packing-mutations";

import { getPackingLists, getPackingItems } from "./packing-queries";

import { loadPackingCache, savePackingCache } from "./packing-cache";

import type { PackingList, PackingListItem } from "../types/packing.types";

type MutationStatus = "pending" | "reconciling" | "failed";

type BaseMutationFields = {
    id: string;
    tripId: number;
    itemId: string;
    createdAt: string;
    attemptCount: number;
    lastError: string | null;
    status: MutationStatus;
};

type TogglePackedMutation = BaseMutationFields & {
    type: "togglePacked";
    packed: boolean;
};

type UpdateQuantityMutation = BaseMutationFields & {
    type: "updateQuantity";
    quantity: number;
};

type HideItemMutation = BaseMutationFields & {
    type: "hideItem";
};

type PendingPackingMutation =
    | TogglePackedMutation
    | UpdateQuantityMutation
    | HideItemMutation;

type PackingMutationType = PendingPackingMutation["type"];

const QUEUE_KEY = "packing-pending-mutations";
const MAX_WRITE_ATTEMPTS = 5;

const mutationHandlers: {
    [Type in PackingMutationType]: (
        mutation: Extract<PendingPackingMutation, { type: Type }>
    ) => Promise<boolean>;
} = {
    togglePacked: (mutation) =>
        togglePackedItem({
            itemId: mutation.itemId,
            packed: mutation.packed,
        }),

    updateQuantity: (mutation) =>
        updatePackingItemQuantity({
            itemId: mutation.itemId,
            quantity: mutation.quantity,
        }),

    hideItem: (mutation) => hidePackingItem(mutation.itemId),
};

function normalizeMutation(raw: Record<string, unknown>): PendingPackingMutation {
    const status =
        raw.status === "reconciling" || raw.status === "failed"
            ? raw.status
            : "pending";

    return {
        ...(raw as unknown as PendingPackingMutation),
        attemptCount: typeof raw.attemptCount === "number" ? raw.attemptCount : 0,
        lastError: typeof raw.lastError === "string" ? raw.lastError : null,
        status,
    };
}

function getQueue(): PendingPackingMutation[] {
    if (typeof window === "undefined") return [];

    const raw = localStorage.getItem(QUEUE_KEY);

    if (!raw) return [];

    try {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.map((entry) => normalizeMutation(entry as Record<string, unknown>));
    } catch {
        return [];
    }
}

// Fired on every persisted queue write (enqueue, write-outcome, reconciliation
// outcome) - kept separate from onPackingReconciled, which is reserved for
// actual data-snapshot updates. A UI subscribing here can recompute status
// counts after any change, including an ordinary successful background sync
// that never touches reconciliation at all.
type QueueChangeListener = () => void;

const queueChangeListeners = new Set<QueueChangeListener>();

export function onPackingQueueChanged(listener: QueueChangeListener) {
    queueChangeListeners.add(listener);
    return () => {
        queueChangeListeners.delete(listener);
    };
}

function notifyQueueChanged() {
    for (const listener of queueChangeListeners) {
        listener();
    }
}

function saveQueue(queue: PendingPackingMutation[]) {
    if (typeof window === "undefined") return;

    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    notifyQueueChanged();
}

function withoutOlderMutationForSameItem(
    queue: PendingPackingMutation[],
    itemId: string,
    type: PackingMutationType
) {
    return queue.filter(
        (mutation) =>
            !(
                mutation.itemId === itemId &&
                mutation.type === type
            )
    );
}

// The only place any mutation's outcome is ever persisted. Always rereads
// storage fresh rather than writing back a snapshot captured before an
// await - a stale whole-queue writeback is exactly the class of bug this
// design exists to prevent. If the mutation is no longer present (already
// superseded by a newer edit, or already resolved by a concurrent pass),
// this is a deliberate no-op - fail closed, never resurrect or guess.
function applyMutationOutcome(
    mutationId: string,
    resolve: (current: PendingPackingMutation) => PendingPackingMutation | null
) {
    const fresh = getQueue();
    const current = fresh.find((mutation) => mutation.id === mutationId);

    if (!current) return;

    const resolved = resolve(current);

    const next =
        resolved === null
            ? fresh.filter((mutation) => mutation.id !== mutationId)
            : fresh.map((mutation) => (mutation.id === mutationId ? resolved : mutation));

    saveQueue(next);
}

export function enqueueTogglePackedMutation({
    tripId,
    itemId,
    packed,
}: {
    tripId: number;
    itemId: string;
    packed: boolean;
}) {
    const queue = getQueue();

    saveQueue([
        ...withoutOlderMutationForSameItem(queue, itemId, "togglePacked"),
        {
            id: crypto.randomUUID(),
            tripId,
            type: "togglePacked",
            itemId,
            packed,
            createdAt: new Date().toISOString(),
            attemptCount: 0,
            lastError: null,
            status: "pending",
        },
    ]);
}

export function enqueueUpdateQuantityMutation({
    tripId,
    itemId,
    quantity,
}: {
    tripId: number;
    itemId: string;
    quantity: number;
}) {
    const queue = getQueue();

    saveQueue([
        ...withoutOlderMutationForSameItem(queue, itemId, "updateQuantity"),
        {
            id: crypto.randomUUID(),
            tripId,
            type: "updateQuantity",
            itemId,
            quantity,
            createdAt: new Date().toISOString(),
            attemptCount: 0,
            lastError: null,
            status: "pending",
        },
    ]);
}

export function enqueueHideItemMutation({
    tripId,
    itemId,
}: {
    tripId: number;
    itemId: string;
}) {
    const queue = getQueue();

    saveQueue([
        ...withoutOlderMutationForSameItem(queue, itemId, "hideItem"),
        {
            id: crypto.randomUUID(),
            tripId,
            type: "hideItem",
            itemId,
            createdAt: new Date().toISOString(),
            attemptCount: 0,
            lastError: null,
            status: "pending",
        },
    ]);
}

// --- Write-attempt classification ---

type WriteOutcome =
    | { kind: "applied" }
    | { kind: "zero-row" }
    | { kind: "retryable"; message: string }
    | { kind: "deterministic"; message: string };

function isDeterministicError(error: unknown): boolean {
    const code = (error as { code?: unknown } | null | undefined)?.code;
    // Only Postgres' 22xxx (data exception) class - malformed/invalid input
    // that will fail again on identical retry. Constraint violations (23xxx)
    // and every other coded error (connection/resource/cancellation classes,
    // permission errors, etc.) can be transient and are treated as
    // retryable-bounded instead, same bucket as a plain transport failure.
    return typeof code === "string" && code.startsWith("22");
}

async function attemptWrite(mutation: PendingPackingMutation): Promise<WriteOutcome> {
    try {
        const handler = mutationHandlers[mutation.type] as (
            m: PendingPackingMutation
        ) => Promise<boolean>;

        const matched = await handler(mutation);

        return matched ? { kind: "applied" } : { kind: "zero-row" };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        if (isDeterministicError(error)) {
            return { kind: "deterministic", message };
        }

        return { kind: "retryable", message };
    }
}

// --- Reconciliation ---

async function fetchTripSnapshot(tripId: number): Promise<{
    lists: PackingList[];
    itemsByList: Record<string, PackingListItem[]>;
} | null> {
    try {
        const lists = await getPackingLists(tripId);

        const entries = await Promise.all(
            lists.map(async (list) => [list.id, await getPackingItems(list.id)] as const)
        );

        return { lists, itemsByList: Object.fromEntries(entries) };
    } catch (error) {
        console.error("Failed to fetch trip snapshot for packing reconciliation", error);
        return null;
    }
}

function findItemInSnapshot(
    itemsByList: Record<string, PackingListItem[]>,
    itemId: string
): PackingListItem | undefined {
    for (const items of Object.values(itemsByList)) {
        const found = items.find((item) => item.id === itemId);
        if (found) return found;
    }
    return undefined;
}

type ReconciliationResult = "matched" | "item-absent" | "value-mismatch";

// Compares only the single field each mutation type actually owns - never
// the whole row. getPackingItems() already excludes hidden=true items
// server-side, so "absent" is the normal, expected signal for a hideItem
// mutation that actually took effect (or for an item hidden/removed by any
// other means - the user-visible outcome is identical either way).
function reconcileAgainstSnapshot(
    mutation: PendingPackingMutation,
    itemsByList: Record<string, PackingListItem[]>
): ReconciliationResult {
    const item = findItemInSnapshot(itemsByList, mutation.itemId);

    if (mutation.type === "hideItem") {
        return item ? "value-mismatch" : "matched";
    }

    if (!item) return "item-absent";

    if (mutation.type === "togglePacked") {
        return item.packed === mutation.packed ? "matched" : "value-mismatch";
    }

    return item.quantity === mutation.quantity ? "matched" : "value-mismatch";
}

function describeUnappliedChange(
    mutation: PendingPackingMutation,
    result: ReconciliationResult
): string {
    if (result === "item-absent") {
        return "This change could not be applied because the item is no longer available in the current packing list.";
    }

    if (mutation.type === "hideItem") {
        return "This item could not be removed — it's still present in the packing list.";
    }

    return "This change could not be applied — the packing list has a different value now.";
}

function resolveReconcilingMutation(
    mutation: PendingPackingMutation,
    itemsByList: Record<string, PackingListItem[]>
) {
    const result = reconcileAgainstSnapshot(mutation, itemsByList);

    applyMutationOutcome(mutation.id, (current) => {
        if (result === "matched") return null;

        return {
            ...current,
            status: "failed",
            lastError: describeUnappliedChange(mutation, result),
        };
    });
}

// Reapplies still-"pending" mutations' optimistic transforms on top of a
// freshly-fetched trip snapshot before it's stored/rendered - "reconciling"
// and "failed" entries are deliberately NOT reapplied here: reapplying a
// guess on top of the exact truth being fetched to evaluate that same guess
// is circular, and a "failed" entry has nothing left to preserve.
function applyPendingOverlay(
    itemsByList: Record<string, PackingListItem[]>,
    mutation: PendingPackingMutation
): Record<string, PackingListItem[]> {
    if (mutation.type === "hideItem") {
        return Object.fromEntries(
            Object.entries(itemsByList).map(([listId, items]) => [
                listId,
                items.filter((item) => item.id !== mutation.itemId),
            ])
        );
    }

    return Object.fromEntries(
        Object.entries(itemsByList).map(([listId, items]) => [
            listId,
            items.map((item) =>
                item.id === mutation.itemId
                    ? {
                        ...item,
                        ...(mutation.type === "togglePacked"
                            ? { packed: mutation.packed }
                            : { quantity: mutation.quantity }),
                    }
                    : item
            ),
        ])
    );
}

// --- Live UI notification ---
//
// packing-sync-queue.ts has no React dependency of its own; reconciliation
// can rewrite a trip's authoritative packing data mid-session (not just at
// mount), so mounted components subscribe here to receive that fresh data
// directly rather than requiring a reload to see it.

type ReconciliationListener = (
    tripId: number,
    lists: PackingList[],
    itemsByList: Record<string, PackingListItem[]>
) => void;

const reconciliationListeners = new Set<ReconciliationListener>();

export function onPackingReconciled(listener: ReconciliationListener) {
    reconciliationListeners.add(listener);
    return () => {
        reconciliationListeners.delete(listener);
    };
}

function notifyReconciled(
    tripId: number,
    lists: PackingList[],
    itemsByList: Record<string, PackingListItem[]>
) {
    for (const listener of reconciliationListeners) {
        listener(tripId, lists, itemsByList);
    }
}

// Persists a reconciled+overlaid snapshot to the same packing-cache-<tripId>
// entry the normal load path reads from - reconciliation must correct the
// stored cache, not just in-memory state, or a stale disproven optimistic
// value can reappear from cache after an offline reload. Trip metadata isn't
// refetched by reconciliation (only lists/items are), so the existing
// cached trip is preserved rather than dropped.
function persistReconciledSnapshot(
    tripId: number,
    lists: PackingList[],
    itemsByList: Record<string, PackingListItem[]>
) {
    const existingCache = loadPackingCache(tripId);
    savePackingCache(tripId, existingCache?.trip ?? null, lists, itemsByList);
}

function groupByTrip(
    mutations: PendingPackingMutation[]
): Map<number, PendingPackingMutation[]> {
    const groups = new Map<number, PendingPackingMutation[]>();

    for (const mutation of mutations) {
        const group = groups.get(mutation.tripId) ?? [];
        group.push(mutation);
        groups.set(mutation.tripId, group);
    }

    return groups;
}

// --- The sync worker ---
//
// Single-flight: a caller arriving while a run is already in progress sets
// syncRequestedWhileRunning and awaits the SAME in-flight promise, rather
// than starting a second overlapping worker. The do/while ensures at least
// one more full pass happens before that shared promise resolves, so work
// that appears mid-run (a new enqueue, a mutation transitioning into
// "reconciling") is picked up within this same invocation instead of
// waiting for some future trigger that may never come for an already-online
// user - which is also why every transition INTO "reconciling" below
// explicitly sets the dirty flag itself, rather than assuming some other
// caller will. attemptedWriteIds/attemptedReconcileIds bound each invocation
// to at most one write attempt per mutation id and one reconciliation-fetch
// attempt per mutation id, regardless of how many passes the dirty flag
// causes - a fresh invocation (next trigger) is always willing to try again.
// Reconciliation tracking is per mutation id, not per trip: once a trip's
// fetch succeeds, every mutation currently "reconciling" for that trip is
// resolved against it, not just the one(s) that triggered the fetch - so a
// second item on the same trip transitioning to "reconciling" mid-invocation
// still gets resolved this same run rather than waiting on its own.

let inFlightSync: Promise<void> | null = null;
let syncRequestedWhileRunning = false;

async function runSyncLoop() {
    const attemptedWriteIds = new Set<string>();
    const attemptedReconcileIds = new Set<string>();

    do {
        syncRequestedWhileRunning = false;

        if (typeof navigator === "undefined" || !navigator.onLine) return;

        // --- Reconciliation pass ---
        const newReconciling = getQueue().filter(
            (mutation) =>
                mutation.status === "reconciling" && !attemptedReconcileIds.has(mutation.id)
        );

        const tripsToFetch = groupByTrip(newReconciling);

        for (const [tripId, triggeringMutations] of tripsToFetch) {
            for (const mutation of triggeringMutations) {
                attemptedReconcileIds.add(mutation.id);
            }

            const snapshot = await fetchTripSnapshot(tripId);
            if (!snapshot) continue; // fetch failed - these stay "reconciling", retried next trigger

            // Resolve EVERY currently-reconciling mutation for this trip
            // against this one snapshot, not just the ones that triggered
            // the fetch - maximizes what one successful fetch resolves.
            const allReconcilingForTrip = getQueue().filter(
                (mutation) => mutation.tripId === tripId && mutation.status === "reconciling"
            );

            for (const mutation of allReconcilingForTrip) {
                attemptedReconcileIds.add(mutation.id);
                resolveReconcilingMutation(mutation, snapshot.itemsByList);
            }

            // Reread before overlaying - the resolutions above (and anything
            // enqueued concurrently) may have changed the queue.
            const overlaidItemsByList = getQueue()
                .filter(
                    (mutation) => mutation.tripId === tripId && mutation.status === "pending"
                )
                .reduce(applyPendingOverlay, snapshot.itemsByList);

            persistReconciledSnapshot(tripId, snapshot.lists, overlaidItemsByList);
            notifyReconciled(tripId, snapshot.lists, overlaidItemsByList);
        }

        // --- Write-attempt pass ---
        const pendingWork = getQueue().filter(
            (mutation) => mutation.status === "pending" && !attemptedWriteIds.has(mutation.id)
        );

        for (const mutation of pendingWork) {
            attemptedWriteIds.add(mutation.id);

            // Fresh-ID preflight, immediately before sending anything - this
            // exact mutation may have been superseded or resolved since the
            // work-list above was captured.
            const stillPending = getQueue().find(
                (candidate) => candidate.id === mutation.id && candidate.status === "pending"
            );
            if (!stillPending) continue;

            const outcome = await attemptWrite(stillPending);

            applyMutationOutcome(stillPending.id, (current) => {
                if (outcome.kind === "applied") return null;

                if (outcome.kind === "zero-row") {
                    syncRequestedWhileRunning = true;
                    return { ...current, status: "reconciling" };
                }

                if (outcome.kind === "deterministic") {
                    syncRequestedWhileRunning = true;
                    return { ...current, status: "reconciling", lastError: outcome.message };
                }

                const attemptCount = current.attemptCount + 1;
                const exhausted = attemptCount >= MAX_WRITE_ATTEMPTS;

                if (exhausted) {
                    syncRequestedWhileRunning = true;
                }

                return {
                    ...current,
                    attemptCount,
                    lastError: outcome.message,
                    status: exhausted ? "reconciling" : "pending",
                };
            });
        }
    } while (syncRequestedWhileRunning);
}

export function syncPendingPackingMutations(): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();

    if (inFlightSync) {
        syncRequestedWhileRunning = true;
        return inFlightSync;
    }

    inFlightSync = runSyncLoop().finally(() => {
        inFlightSync = null;
    });

    return inFlightSync;
}

export function getPendingPackingMutationCount() {
    return getQueue().length;
}

export function getPackingMutationStatusCounts(tripId: number) {
    const queue = getQueue().filter((mutation) => mutation.tripId === tripId);

    return {
        pending: queue.filter((mutation) => mutation.status === "pending").length,
        reconciling: queue.filter((mutation) => mutation.status === "reconciling").length,
        failed: queue.filter((mutation) => mutation.status === "failed").length,
    };
}
