"use client";

import PackingTripHero from "./packing-trip-hero";
import { useEffect, useMemo, useState } from "react";
import CreatePackingListButton from "./create-packing-list-button";
import NewPackingListButton from "./new-packing-list-button";
import PackingListCard from "./packing-list-card";
import {
    archivePackingList,
    hidePackingItem,
    togglePackedItem,
    updatePackingItemQuantity,
} from "../lib/packing-mutations";

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
    const [itemPendingRemove, setItemPendingRemove] =
        useState<PackingListItem | null>(null);

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
                            tripDays={trip ? calculateTripDays(trip.start_date, trip.end_date) : 1}
                            onToggleItem={handleToggleItem}
                            onCreateItem={(listId, item) => {
                                setItemsByList((current) => ({
                                    ...current,
                                    [listId]: [...(current[listId] ?? []), item],
                                }));
                            }}
                            onDecreaseQuantity={async (item) => {
                                if (item.quantity <= 1) {
                                    setItemPendingRemove(item);
                                    return;
                                }
                                const nextQuantity = Math.max(1, item.quantity - 1);

                                setItemsByList((current) => ({
                                    ...current,
                                    [item.packing_list_id]: (current[item.packing_list_id] ?? []).map(
                                        (currentItem) =>
                                            currentItem.id === item.id
                                                ? { ...currentItem, quantity: nextQuantity }
                                                : currentItem
                                    ),
                                }));

                                try {
                                    await updatePackingItemQuantity({
                                        itemId: item.id,
                                        quantity: nextQuantity,
                                    });
                                } catch (error) {
                                    console.error(error);
                                    await loadPacking();
                                }
                            }}
                            onIncreaseQuantity={async (item) => {
                                const nextQuantity = item.quantity + 1;

                                setItemsByList((current) => ({
                                    ...current,
                                    [item.packing_list_id]: (current[item.packing_list_id] ?? []).map(
                                        (currentItem) =>
                                            currentItem.id === item.id
                                                ? { ...currentItem, quantity: nextQuantity }
                                                : currentItem
                                    ),
                                }));

                                try {
                                    await updatePackingItemQuantity({
                                        itemId: item.id,
                                        quantity: nextQuantity,
                                    });
                                } catch (error) {
                                    console.error(error);
                                    await loadPacking();
                                }
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
            {itemPendingRemove && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
                    <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 text-center shadow-2xl">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-2xl">
                            🧳
                        </div>

                        <h2 className="text-xl font-bold text-neutral-950">
                            Remove item?
                        </h2>

                        <p className="mt-2 text-sm text-neutral-500">
                            Remove “{itemPendingRemove.name}” from this packing list?
                        </p>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setItemPendingRemove(null)}
                                className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-bold text-neutral-700"
                            >
                                Keep it
                            </button>

                            <button
                                type="button"
                                onClick={async () => {
                                    const item = itemPendingRemove;

                                    setItemPendingRemove(null);

                                    setItemsByList((current) => ({
                                        ...current,
                                        [item.packing_list_id]: (
                                            current[item.packing_list_id] ?? []
                                        ).filter((currentItem) => currentItem.id !== item.id),
                                    }));

                                    try {
                                        await hidePackingItem(item.id);
                                    } catch (error) {
                                        console.error(error);
                                        await loadPacking();
                                    }
                                }}
                                className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-bold text-white"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}