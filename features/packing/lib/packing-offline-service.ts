import {
    updateCachedPackingItem,
    removeCachedPackingItem,
} from "./packing-cache";

import {
    enqueueTogglePackedMutation,
    enqueueUpdateQuantityMutation,
    enqueueHideItemMutation,
    syncPendingPackingMutations,
} from "./packing-sync-queue";

// Every packing write goes through the queue, online or not - there is no
// direct-write path. A direct-write bypass would mean two independent
// routes to the server for the same row, which can race against the
// queue's own sequential, single-flighted worker (an in-flight direct write
// for an old value could still land after a newer edit has already
// superseded it locally). Routing everything through the queue means the
// worker is the only thing that ever talks to the server, and it only ever
// does so one mutation at a time.
async function executeOfflineAwarePackingMutation({
    optimisticUpdate,
    enqueue,
}: {
    optimisticUpdate: () => void;
    enqueue: () => void;
}) {
    optimisticUpdate();
    enqueue();

    if (typeof navigator !== "undefined" && !navigator.onLine) {
        return;
    }

    await syncPendingPackingMutations();
}

export async function togglePackedOfflineAware({
    tripId,
    itemId,
    packed,
    updatedAt,
}: {
    tripId: number;
    itemId: string;
    packed: boolean;
    updatedAt: string;
}) {
    return executeOfflineAwarePackingMutation({
        optimisticUpdate: () => {
            updateCachedPackingItem(tripId, itemId, {
                packed,
                packed_at: packed ? updatedAt : null,
                updated_at: updatedAt,
            });
        },
        enqueue: () => {
            enqueueTogglePackedMutation({
                tripId,
                itemId,
                packed,
            });
        },
    });
}

export async function updateQuantityOfflineAware({
    tripId,
    itemId,
    quantity,
    updatedAt,
}: {
    tripId: number;
    itemId: string;
    quantity: number;
    updatedAt: string;
}) {
    return executeOfflineAwarePackingMutation({
        optimisticUpdate: () => {
            updateCachedPackingItem(tripId, itemId, {
                quantity,
                updated_at: updatedAt,
            });
        },
        enqueue: () => {
            enqueueUpdateQuantityMutation({
                tripId,
                itemId,
                quantity,
            });
        },
    });
}

export async function hideItemOfflineAware({
    tripId,
    itemId,
}: {
    tripId: number;
    itemId: string;
}) {
    return executeOfflineAwarePackingMutation({
        optimisticUpdate: () => {
            removeCachedPackingItem(tripId, itemId);
        },
        enqueue: () => {
            enqueueHideItemMutation({
                tripId,
                itemId,
            });
        },
    });
}