import {
    togglePackedItem,
    updatePackingItemQuantity,
    hidePackingItem,
} from "./packing-mutations";

import {
    updateCachedPackingItem,
    removeCachedPackingItem,
} from "./packing-cache";

import {
    enqueueTogglePackedMutation,
    enqueueUpdateQuantityMutation,
    enqueueHideItemMutation,
} from "./packing-sync-queue";

async function executeOfflineAwarePackingMutation({
    optimisticUpdate,
    enqueue,
    serverMutation,
    warningMessage,
}: {
    optimisticUpdate: () => void;
    enqueue: () => void;
    serverMutation: () => Promise<void>;
    warningMessage: string;
}) {
    optimisticUpdate();

    if (typeof navigator !== "undefined" && !navigator.onLine) {
        enqueue();
        return;
    }

    try {
        await serverMutation();
    } catch (error) {
        console.warn(warningMessage, error);
        enqueue();
    }
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
        serverMutation: () =>
            togglePackedItem({
                itemId,
                packed,
            }),
        warningMessage:
            "Packing change saved locally and will sync later.",
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
        serverMutation: () =>
            updatePackingItemQuantity({
                itemId,
                quantity,
            }),
        warningMessage:
            "Quantity change saved locally and will sync later.",
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
        serverMutation: () => hidePackingItem(itemId),
        warningMessage:
            "Item removal saved locally and will sync later.",
    });
}