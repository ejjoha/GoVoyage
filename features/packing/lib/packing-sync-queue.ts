import {
    togglePackedItem,
    updatePackingItemQuantity,
} from "./packing-mutations";

type TogglePackedMutation = {
    id: string;
    tripId: number;
    type: "togglePacked";
    itemId: string;
    packed: boolean;
    createdAt: string;
};

type UpdateQuantityMutation = {
    id: string;
    tripId: number;
    type: "updateQuantity";
    itemId: string;
    quantity: number;
    createdAt: string;
};

type PendingPackingMutation =
    | TogglePackedMutation
    | UpdateQuantityMutation;

const QUEUE_KEY = "packing-pending-mutations";

function getQueue(): PendingPackingMutation[] {
    if (typeof window === "undefined") return [];

    const raw = localStorage.getItem(QUEUE_KEY);

    if (!raw) return [];

    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveQueue(queue: PendingPackingMutation[]) {
    if (typeof window === "undefined") return;

    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function withoutOlderMutationForSameItem(
    queue: PendingPackingMutation[],
    itemId: string,
    type: PendingPackingMutation["type"]
) {
    return queue.filter(
        (mutation) =>
            !(
                mutation.itemId === itemId &&
                mutation.type === type
            )
    );
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
        },
    ]);
}

export async function syncPendingPackingMutations() {
    if (typeof window === "undefined") return;

    if (!window.navigator.onLine) {
        return;
    }

    const queue = getQueue();

    if (queue.length === 0) return;

    const remaining: PendingPackingMutation[] = [];

    for (const mutation of queue) {
        try {
            if (mutation.type === "togglePacked") {
                await togglePackedItem({
                    itemId: mutation.itemId,
                    packed: mutation.packed,
                });
            }

            if (mutation.type === "updateQuantity") {
                await updatePackingItemQuantity({
                    itemId: mutation.itemId,
                    quantity: mutation.quantity,
                });
            }
        } catch (error) {
            console.error("Failed to sync packing mutation", error);
            remaining.push(mutation);
        }
    }

    saveQueue(remaining);
}

export function getPendingPackingMutationCount() {
    return getQueue().length;
}
