import { useCallback, useEffect, useRef, useState } from "react";

import {
    loadPackingCache,
    savePackingCache,
} from "../lib/packing-cache";

import {
    getPackingItems,
    getPackingLists,
    getTripForPacking,
} from "../lib/packing-queries";

import {
    getTripWeatherSummary,
    type TripWeatherSummary,
} from "../lib/weather-intelligence";

import {
    syncPendingPackingMutations,
    onPackingReconciled,
} from "../lib/packing-sync-queue";

import { getItemFromList } from "../lib/packing-state";

import type {
    PackingList,
    PackingListItem,
} from "../types/packing.types";

type TripForPacking = Awaited<ReturnType<typeof getTripForPacking>>;

async function getWeatherSummaryWithTimeout(destination: string) {
    const timeoutMs = 2500;

    return Promise.race([
        getTripWeatherSummary(destination),
        new Promise<TripWeatherSummary | null>((resolve) => {
            window.setTimeout(() => resolve(null), timeoutMs);
        }),
    ]);
}

export function usePackingData({
    tripId,
    requestedListId,
}: {
    tripId: number;
    requestedListId: string | null;
}) {
    const [lists, setLists] = useState<PackingList[]>([]);
    const [itemsByList, setItemsByListState] = useState<
        Record<string, PackingListItem[]>
    >({});
    // Mirrors itemsByList synchronously, ahead of React's own commit, so a
    // second synchronous call in the same tick (e.g. a double-tap on the
    // same toggle/quantity control) can read the value the first call just
    // applied instead of a stale render-time prop. Every write to
    // itemsByList must go through setItemsByList below, which is the only
    // thing that keeps this ref in sync - it is not written anywhere else.
    // Kept private to this hook - callers read it only through
    // getLatestItem below, never the ref itself.
    const itemsByListRef = useRef<Record<string, PackingListItem[]>>({});

    const setItemsByList = useCallback(
        (
            updater:
                | Record<string, PackingListItem[]>
                | ((
                    prev: Record<string, PackingListItem[]>
                ) => Record<string, PackingListItem[]>)
        ) => {
            const next =
                typeof updater === "function"
                    ? updater(itemsByListRef.current)
                    : updater;

            itemsByListRef.current = next;
            setItemsByListState(next);
        },
        []
    );

    const getLatestItem = useCallback(
        (listId: string, itemId: string) =>
            getItemFromList(itemsByListRef.current, listId, itemId),
        []
    );

    const [loading, setLoading] = useState(true);
    const [hasCheckedServer, setHasCheckedServer] = useState(false);
    const [trip, setTrip] = useState<TripForPacking | null>(null);
    const [activeListId, setActiveListId] = useState<string | null>(null);
    const [weatherSummary, setWeatherSummary] =
        useState<TripWeatherSummary | null>(null);

    const loadPacking = useCallback(async () => {
        setHasCheckedServer(false);

        const cachedPacking = loadPackingCache(tripId);

        if (cachedPacking) {
            setTrip(cachedPacking.trip);
            setLists(cachedPacking.lists);
            setItemsByList(
                Object.fromEntries(
                    Object.entries(cachedPacking.itemsByList).map(([listId, items]) => [
                        listId,
                        items.filter((item) => !item.hidden),
                    ])
                )
            );
            setActiveListId((current) => {
                if (
                    requestedListId &&
                    cachedPacking.lists.some((list) => list.id === requestedListId)
                ) {
                    return requestedListId;
                }

                return current ?? cachedPacking.lists[0]?.id ?? null;
            });
            setLoading(false);

            if (typeof navigator !== "undefined" && !navigator.onLine) {
                return;
            }
        } else {
            setLoading(true);

            if (typeof navigator !== "undefined" && !navigator.onLine) {
                setLoading(false);
                return;
            }
        }

        try {
            const tripData = await getTripForPacking(tripId);
            setTrip(tripData);

            const packingListsPromise = getPackingLists(tripId);

            const weatherSummaryPromise = tripData?.destination
                ? getWeatherSummaryWithTimeout(tripData.destination)
                : Promise.resolve(null);

            const [packingLists, weather] = await Promise.all([
                packingListsPromise,
                weatherSummaryPromise,
            ]);

            setHasCheckedServer(true);
            setWeatherSummary(weather);

            setLists(packingLists);

            setActiveListId((current) => {
                if (
                    requestedListId &&
                    packingLists.some((list) => list.id === requestedListId)
                ) {
                    return requestedListId;
                }

                return current ?? packingLists[0]?.id ?? null;
            });

            const itemEntries = await Promise.all(
                packingLists.map(async (list) => {
                    const items = await getPackingItems(list.id);
                    return [list.id, items] as const;
                })
            );

            const nextItemsByList = Object.fromEntries(itemEntries);

            setItemsByList(nextItemsByList);

            savePackingCache(tripId, tripData, packingLists, nextItemsByList);
        } catch (error) {
            console.error(error);
            setWeatherSummary(null);
        } finally {
            setLoading(false);
        }
    }, [tripId, requestedListId]);

    useEffect(() => {
        async function mountSync() {
            // Drain any work already queued from a previous session before
            // this one's first fetch - reopening the app already online
            // must not require a future online transition to retry it.
            if (typeof navigator !== "undefined" && navigator.onLine) {
                await syncPendingPackingMutations();
            }

            await loadPacking();
        }

        mountSync();

        async function handleOnline() {
            if (!window.navigator.onLine) return;

            await syncPendingPackingMutations();
            await loadPacking();
        }

        window.addEventListener("online", handleOnline);

        const unsubscribeReconciled = onPackingReconciled(
            (reconciledTripId, reconciledLists, reconciledItemsByList) => {
                if (reconciledTripId !== tripId) return;

                setLists(reconciledLists);
                setItemsByList(
                    Object.fromEntries(
                        Object.entries(reconciledItemsByList).map(([listId, items]) => [
                            listId,
                            items.filter((item) => !item.hidden),
                        ])
                    )
                );
            }
        );

        return () => {
            window.removeEventListener("online", handleOnline);
            unsubscribeReconciled();
        };
    }, [loadPacking, tripId]);

    return {
        trip,
        lists,
        setLists,
        itemsByList,
        setItemsByList,
        getLatestItem,
        loading,
        hasCheckedServer,
        activeListId,
        setActiveListId,
        weatherSummary,
        loadPacking,
    };
}