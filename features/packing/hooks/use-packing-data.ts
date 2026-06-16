import { useCallback, useEffect, useState } from "react";

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
} from "../lib/packing-sync-queue";

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
    const [itemsByList, setItemsByList] = useState<
        Record<string, PackingListItem[]>
    >({});
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
        loadPacking();

        async function handleOnline() {
            if (!window.navigator.onLine) return;

            await syncPendingPackingMutations();
            await loadPacking();
        }

        window.addEventListener("online", handleOnline);

        return () => {
            window.removeEventListener("online", handleOnline);
        };
    }, [loadPacking]);

    return {
        trip,
        lists,
        setLists,
        itemsByList,
        setItemsByList,
        loading,
        hasCheckedServer,
        activeListId,
        setActiveListId,
        weatherSummary,
        loadPacking,
    };
}