import type {
    PackingList,
    PackingListItem,
} from "../types/packing.types";

type CachedTrip = {
    id: number;
    title: string;
    destination: string | null;
    image_url: string | null;
    start_date: string | null;
    end_date: string | null;
};

type PackingCache = {
    tripId: number;
    cachedAt: string;
    trip: CachedTrip | null;
    lists: PackingList[];
    itemsByList: Record<string, PackingListItem[]>;
};

export function savePackingCache(
    tripId: number,
    trip: CachedTrip | null,
    lists: PackingList[],
    itemsByList: Record<string, PackingListItem[]>
) {
    if (typeof window === "undefined") return;

    localStorage.setItem(
        `packing-cache-${tripId}`,
        JSON.stringify({
            tripId,
            cachedAt: new Date().toISOString(),
            trip,
            lists,
            itemsByList,
        })
    );
}

export function loadPackingCache(
    tripId: number
): PackingCache | null {
    if (typeof window === "undefined") return null;

    const raw = localStorage.getItem(
        `packing-cache-${tripId}`
    );

    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function updateCachedPackingItem(
    tripId: number,
    itemId: string,
    update: Partial<PackingListItem>
) {
    const cache = loadPackingCache(tripId);

    if (!cache) return;

    const nextItemsByList = Object.fromEntries(
        Object.entries(cache.itemsByList).map(([listId, items]) => [
            listId,
            items.map((item) =>
                item.id === itemId
                    ? {
                        ...item,
                        ...update,
                    }
                    : item
            ),
        ])
    );

    localStorage.setItem(
        `packing-cache-${tripId}`,
        JSON.stringify({
            ...cache,
            cachedAt: new Date().toISOString(),
            itemsByList: nextItemsByList,
        })
    );
}