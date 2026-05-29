"use client";

import PackingTripHero from "./packing-trip-hero";
import { useEffect, useMemo, useState } from "react";
import CreatePackingListButton from "./create-packing-list-button";
import NewPackingListButton from "./new-packing-list-button";
import PackingListCard from "./packing-list-card";
import { archivePackingList, togglePackedItem } from "../lib/packing-mutations";

import {
    getPackingItems,
    getPackingLists,
    getTripForPacking,
} from "../lib/packing-queries";

import type {
    PackingList,
    PackingListItem,
} from "../types/packing.types";

type TripForPacking = Awaited<ReturnType<typeof getTripForPacking>>;

type Props = {
    tripId: number;
};

function calculateTripDays(startDate?: string | null, endDate?: string | null) {
    if (!startDate || !endDate) return 1;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const differenceInMs = end.getTime() - start.getTime();
    const days = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24)) + 1;

    return Math.max(days, 1);
}

export default function PackingBoard({ tripId }: Props) {
    const [lists, setLists] = useState<PackingList[]>([]);
    const [itemsByList, setItemsByList] = useState<
        Record<string, PackingListItem[]>
    >({});
    const [loading, setLoading] = useState(true);
    const [trip, setTrip] = useState<TripForPacking | null>(null);

    async function loadPacking() {
        setLoading(true);
        const tripData = await getTripForPacking(tripId);
        setTrip(tripData);

        const packingLists = await getPackingLists(tripId);
        setLists(packingLists);

        const itemEntries = await Promise.all(
            packingLists.map(async (list) => {
                const items = await getPackingItems(list.id);
                return [list.id, items] as const;
            })
        );

        setItemsByList(Object.fromEntries(itemEntries));
        setLoading(false);
    }

    useEffect(() => {
        loadPacking();
    }, [tripId]);

    const allItems = useMemo(
        () => Object.values(itemsByList).flat(),
        [itemsByList]
    );

    const packedCount = allItems.filter((item) => item.packed).length;
    const totalCount = allItems.length;

    async function handleToggleItem(item: PackingListItem) {
        const nextPacked = !item.packed;

        setItemsByList((current) => {
            const listItems = current[item.packing_list_id] ?? [];

            return {
                ...current,
                [item.packing_list_id]: listItems.map((currentItem) =>
                    currentItem.id === item.id
                        ? { ...currentItem, packed: nextPacked }
                        : currentItem
                ),
            };
        });

        try {
            await togglePackedItem({
                itemId: item.id,
                packed: nextPacked,
            });
        } catch (error) {
            console.error(error);
            await loadPacking();
        }
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-6">
            {trip && (
                <PackingTripHero
                    tripId={tripId}
                    title={trip.title}
                    destination={trip.destination}
                    days={calculateTripDays(trip.start_date, trip.end_date)}
                    nights={Math.max(calculateTripDays(trip.start_date, trip.end_date) - 1, 0)}
                    imageUrl={trip.image_url}
                    packedCount={packedCount}
                    totalCount={totalCount}
                />
            )}

            <NewPackingListButton
                tripId={tripId}
                onCreated={(list) => {
                    setLists((current) => [...current, list]);
                    setItemsByList((current) => ({
                        ...current,
                        [list.id]: [],
                    }));
                }}
            />

            {loading && (
                <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-neutral-400">
                        Loading packing lists…
                    </p>
                </div>
            )}

            {!loading && lists.length === 0 && (
                <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
                    <p className="text-base font-semibold text-neutral-900">
                        Start with your first list
                    </p>

                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                        Create a list for yourself, a family member, or something shared.
                    </p>

                    <CreatePackingListButton
                        tripId={tripId}
                        onCreated={(list) => {
                            setLists((current) => [...current, list]);
                            setItemsByList((current) => ({
                                ...current,
                                [list.id]: [],
                            }));
                        }}
                    />
                </div>
            )}

            {!loading && lists.length > 0 && (
                <div className="space-y-4 pb-24">
                    {lists.map((list) => (
                        <PackingListCard
                            key={list.id}
                            list={list}
                            items={itemsByList[list.id] ?? []}
                            onToggleItem={handleToggleItem}
                            onCreateItem={(listId, item) => {
                                setItemsByList((current) => ({
                                    ...current,
                                    [listId]: [...(current[listId] ?? []), item],
                                }));
                            }}
                            onArchiveList={async (listId) => {
                                setLists((current) => current.filter((list) => list.id !== listId));

                                setItemsByList((current) => {
                                    const next = { ...current };
                                    delete next[listId];
                                    return next;
                                });

                                try {
                                    await archivePackingList(listId);
                                } catch (error) {
                                    console.error(error);
                                    await loadPacking();
                                }
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}