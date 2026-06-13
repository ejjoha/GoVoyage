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
    updateCachedPackingItem(tripId, itemId, {
        packed,
        packed_at: packed ? updatedAt : null,
        updated_at: updatedAt,
    });

    if (typeof navigator !== "undefined" && !navigator.onLine) {
        enqueueTogglePackedMutation({
            tripId,
            itemId,
            packed,
        });

        return;
    }

    try {
        await togglePackedItem({
            itemId,
            packed,
        });
    } catch (error) {
        console.warn("Packing change saved locally and will sync later.", error);

        enqueueTogglePackedMutation({
            tripId,
            itemId,
            packed,
        });
    }
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
    updateCachedPackingItem(tripId, itemId, {
        quantity,
        updated_at: updatedAt,
    });

    if (typeof navigator !== "undefined" && !navigator.onLine) {
        enqueueUpdateQuantityMutation({
            tripId,
            itemId,
            quantity,
        });

        return;
    }

    try {
        await updatePackingItemQuantity({
            itemId,
            quantity,
        });
    } catch (error) {
        console.warn("Quantity change saved locally and will sync later.", error);

        enqueueUpdateQuantityMutation({
            tripId,
            itemId,
            quantity,
        });
    }
}

export async function hideItemOfflineAware({
    tripId,
    itemId,
}: {
    tripId: number;
    itemId: string;
}) {
    removeCachedPackingItem(tripId, itemId);

    if (typeof navigator !== "undefined" && !navigator.onLine) {
        enqueueHideItemMutation({
            tripId,
            itemId,
        });

        return;
    }

    try {
        await hidePackingItem(itemId);
    } catch (error) {
        console.warn("Item removal saved locally and will sync later.", error);

        enqueueHideItemMutation({
            tripId,
            itemId,
        });
    }
}