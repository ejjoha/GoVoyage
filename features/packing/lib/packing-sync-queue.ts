import {
    togglePackedItem,
    updatePackingItemQuantity,
    hidePackingItem,
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

type HideItemMutation = {
    id: string;
    tripId: number;
    type: "hideItem";
    itemId: string;
    createdAt: string;
};

type PendingPackingMutation =
    | TogglePackedMutation
    | UpdateQuantityMutation
    | HideItemMutation;

type PackingMutationType = PendingPackingMutation["type"];

type PackingMutationHandler<T extends PendingPackingMutation> = (
    mutation: T
) => Promise<void>;

const QUEUE_KEY = "packing-pending-mutations";

const mutationHandlers: {
    [Type in PackingMutationType]: PackingMutationHandler<
        Extract<PendingPackingMutation, { type: Type }>
    >;
} = {
    togglePacked: async (mutation) => {
        await togglePackedItem({
            itemId: mutation.itemId,
            packed: mutation.packed,
        });
    },

    updateQuantity: async (mutation) => {
        await updatePackingItemQuantity({
            itemId: mutation.itemId,
            quantity: mutation.quantity,
        });
    },

    hideItem: async (mutation) => {
        await hidePackingItem(mutation.itemId);
    },
};

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

async function runPackingMutation(mutation: PendingPackingMutation) {
    const handler = mutationHandlers[mutation.type] as PackingMutationHandler<
        typeof mutation
    >;

    await handler(mutation);
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
            await runPackingMutation(mutation);
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
