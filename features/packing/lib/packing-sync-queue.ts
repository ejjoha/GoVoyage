import { togglePackedItem } from "./packing-mutations";

type PendingPackingMutation = {
    id: string;
    tripId: number;
    type: "togglePacked";
    itemId: string;
    packed: boolean;
    createdAt: string;
};

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

    const withoutOlderToggleForSameItem = queue.filter(
        (mutation) =>
            !(
                mutation.type === "togglePacked" &&
                mutation.itemId === itemId
            )
    );

    saveQueue([
        ...withoutOlderToggleForSameItem,
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
