"use client";

import PackingBoardSkeleton from "./packing-board-skeleton";
import PackingTripHero from "./packing-trip-hero";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AddPackingCategoriesModal from "./add-packing-categories-modal";
import PackingSpaceSelector from "./packing-space-selector";
import PackingListCard from "./packing-list-card";
import FloatingAddPackingItemButton from "./floating-add-packing-item-button";
import { AnimatePresence, motion } from "framer-motion";
import { kidsStarterItems } from "../lib/kids-packing-items";

import {
    loadPackingCache,
    savePackingCache,
} from "../lib/packing-cache";

import {
    getTripWeatherSummary,
    type TripWeatherSummary,
} from "../lib/weather-intelligence";

import {
    getPackingItems,
    getPackingLists,
    getTripForPacking,
} from "../lib/packing-queries";

import type {
    PackingList,
    PackingListItem,
} from "../types/packing.types";

import {
    archivePackingList,
    createPackingList,
    createSuggestedPackingItems,
    hidePackingListItems,
} from "../lib/packing-mutations";

import PackingNextActions from "./packing-next-actions";

import {
    baseItems,
    getEssentialsStarterItems,
    getLaundryAwareQuantity,
    getPreferenceAdjustedQuantity,
} from "../lib/packing-template-engine";

import {
    syncPendingPackingMutations,
} from "../lib/packing-sync-queue";

import {
    togglePackedOfflineAware,
    updateQuantityOfflineAware,
    hideItemOfflineAware,
} from "../lib/packing-offline-service";

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
    const searchParams = useSearchParams();
    const requestedListId = searchParams.get("list");
    const [lists, setLists] = useState<PackingList[]>([]);
    const [itemsByList, setItemsByList] = useState<
        Record<string, PackingListItem[]>
    >({});
    const [loading, setLoading] = useState(true);
    const [initializingFirstList, setInitializingFirstList] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);

    const [trip, setTrip] = useState<TripForPacking | null>(null);
    const [activeListId, setActiveListId] = useState<string | null>(null);
    const [weatherSummary, setWeatherSummary] =
        useState<TripWeatherSummary | null>(null);
    const [itemPendingRemove, setItemPendingRemove] =
        useState<PackingListItem | null>(null);
    const [listActionPending, setListActionPending] =
        useState<{
            type: "reset" | "delete";
            list: PackingList;
        } | null>(null);

    const [resetSwipeKey, setResetSwipeKey] = useState(0);

    async function getWeatherSummaryWithTimeout(destination: string) {
        const timeoutMs = 2500;

        return Promise.race([
            getTripWeatherSummary(destination),
            new Promise<TripWeatherSummary | null>((resolve) => {
                window.setTimeout(() => resolve(null), timeoutMs);
            }),
        ]);
    }

    async function loadPacking() {
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
    }

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
    }, [tripId]);

    async function initializeFirstPackingList() {
        if (initializingFirstList) return;

        setInitializingFirstList(true);

        const startedAt = Date.now();

        try {
            const list = await createPackingList({
                tripId,
                title: "My List",
                type: "personal",
                emoji: "🧳",
            });
            const tripDays = trip
                ? calculateTripDays(trip.start_date, trip.end_date)
                : 1;

            const baselineItems = baseItems
                .filter((item) =>
                    ["Clothing", "Toiletries", "Tech"].includes(item.category)
                )
                .map((item) => ({
                    name: item.name,
                    category: item.category,
                    quantity: getPreferenceAdjustedQuantity({
                        quantity: getLaundryAwareQuantity({
                            item,
                            tripDays,
                            laundry,
                        }),
                        preference: packingPreference,
                    }),
                    source: "suggested" as const,
                    packed: false,
                    hidden: false,
                    protected: Boolean(item.protected),
                }));

            const createdItems = await createSuggestedPackingItems({
                packingListId: list.id,
                items: [
                    ...getEssentialsStarterItems(),
                    ...baselineItems,
                ],
            });

            setLists([list]);

            setItemsByList({
                [list.id]: createdItems,
            });

            setActiveListId(list.id);
        } finally {
            const elapsed = Date.now() - startedAt;
            const remaining = Math.max(0, 1600 - elapsed);

            window.setTimeout(() => {
                setInitializingFirstList(false);
            }, remaining);
        }
    }
    useEffect(() => {
        if (!categoryModalOpen) return;

        const saved = localStorage.getItem(`packing-activities-${tripId}`);

        if (!saved) {
            setActivities([]);
            return;
        }

        setActivities(JSON.parse(saved));
    }, [categoryModalOpen, tripId]);
    useEffect(() => {
        if (
            !loading &&
            lists.length === 0 &&
            trip &&
            !initializingFirstList
        ) {
            initializeFirstPackingList();
        }
    }, [
        loading,
        lists.length,
        trip,
        initializingFirstList,
    ]);

    useEffect(() => {
        const saved = localStorage.getItem(
            `packing-preference-${tripId}`
        );

        if (
            saved === "Light" ||
            saved === "Balanced" ||
            saved === "Pack Everything"
        ) {
            setPackingPreference(saved);
        }
    }, [tripId, categoryModalOpen]);

    const allItems = useMemo(
        () => Object.values(itemsByList).flat(),
        [itemsByList]
    );

    const packedCount = allItems.filter((item) => item.packed).length;
    const totalCount = allItems.length;
    const activeList = lists.find((list) => list.id === activeListId) ?? lists[0] ?? null;
    const [laundry, setLaundry] = useState<"Available" | "Hotel service" | "Not available">(() => {
        if (typeof window === "undefined") return "Not available";

        const saved = localStorage.getItem(`packing-laundry-${tripId}`);

        if (
            saved === "Available" ||
            saved === "Hotel service" ||
            saved === "Not available"
        ) {
            return saved;
        }

        return "Not available";
    });
    const [packingPreference, setPackingPreference] =
        useState<"Light" | "Balanced" | "Pack Everything">(
            "Balanced"
        );
    const [activities, setActivities] = useState<string[]>([]);

    async function handleToggleItem(item: PackingListItem) {
        const nextPacked = !item.packed;
        const now = new Date().toISOString();

        setItemsByList((current) => {
            const listItems = current[item.packing_list_id] ?? [];

            return {
                ...current,
                [item.packing_list_id]: listItems.map((currentItem) =>
                    currentItem.id === item.id
                        ? {
                            ...currentItem,
                            packed: nextPacked,
                            packed_at: nextPacked ? now : null,
                            updated_at: now,
                        }
                        : currentItem
                ),
            };
        });

        await togglePackedOfflineAware({
            tripId,
            itemId: item.id,
            packed: nextPacked,
            updatedAt: now,
        });
    }

    function handleAddTripRecommendations() {
        console.log("Add trip recommendations");
    }

    function handleAddCategories() {
        setCategoryModalOpen(true);
    }

    return (
        <div className="mx-auto max-w-xl px-4 py-6">
            {trip && (
                <PackingTripHero
                    tripId={tripId}
                    title={trip.title}
                    destination={trip.destination}
                    days={calculateTripDays(trip.start_date, trip.end_date)}
                    nights={Math.max(calculateTripDays(trip.start_date, trip.end_date) - 1, 0)}
                    imageUrl={trip.image_url}
                    temperature={weatherSummary?.temperature ?? null}
                    weatherLabel={weatherSummary?.weatherLabel ?? null}
                    rainChance={weatherSummary?.precipitationProbability ?? null}
                    packedCount={packedCount}
                    totalCount={totalCount}
                />
            )}

            {loading && <PackingBoardSkeleton />}

            {!loading && lists.length > 0 && activeList && (
                <div className="pb-24">
                    <PackingSpaceSelector
                        tripDays={trip ? calculateTripDays(trip.start_date, trip.end_date) : 1}
                        defaultClimates={[]}
                        tripId={tripId}
                        lists={lists}
                        itemsByList={itemsByList}
                        activeListId={activeList.id}
                        onSelectList={setActiveListId}
                        onCreated={(list, createdItems = []) => {
                            setLists((current) => [...current, list]);
                            setItemsByList((current) => ({
                                ...current,
                                [list.id]: createdItems,
                            }));
                            setActiveListId(list.id);
                        }}
                        onOpenCategories={() => setCategoryModalOpen(true)}
                    />
                    <PackingListCard
                        key={activeList.id}
                        list={activeList}
                        items={itemsByList[activeList.id] ?? []}
                        resetSwipeKey={resetSwipeKey}
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
                            const now = new Date().toISOString();

                            setItemsByList((current) => ({
                                ...current,
                                [item.packing_list_id]: (current[item.packing_list_id] ?? []).map(
                                    (currentItem) =>
                                        currentItem.id === item.id
                                            ? {
                                                ...currentItem,
                                                quantity: nextQuantity,
                                                updated_at: now,
                                            }
                                            : currentItem
                                ),
                            }));

                            await updateQuantityOfflineAware({
                                tripId,
                                itemId: item.id,
                                quantity: nextQuantity,
                                updatedAt: now,
                            });
                        }}
                        onIncreaseQuantity={async (item) => {
                            const nextQuantity = item.quantity + 1;
                            const now = new Date().toISOString();

                            setItemsByList((current) => ({
                                ...current,
                                [item.packing_list_id]: (current[item.packing_list_id] ?? []).map(
                                    (currentItem) =>
                                        currentItem.id === item.id
                                            ? {
                                                ...currentItem,
                                                quantity: nextQuantity,
                                                updated_at: now,
                                            }
                                            : currentItem
                                ),
                            }));

                            await updateQuantityOfflineAware({
                                tripId,
                                itemId: item.id,
                                quantity: nextQuantity,
                                updatedAt: now,
                            });
                        }}
                        onRemoveItem={(item) => setItemPendingRemove(item)}
                        onResetList={(list) =>
                            setListActionPending({
                                type: "reset",
                                list,
                            })
                        }

                        onDeleteList={(list) =>
                            setListActionPending({
                                type: "delete",
                                list,
                            })
                        }
                    />

                    <FloatingAddPackingItemButton
                        packingListId={activeList.id}
                        existingItems={itemsByList[activeList.id] ?? []}
                        onCreated={(item) => {
                            setItemsByList((current) => ({
                                ...current,
                                [activeList.id]: [...(current[activeList.id] ?? []), item],
                            }));
                        }}
                    />
                </div>
            )}
            <AnimatePresence>
                {initializingFirstList && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 px-4 pt-28"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 18, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 18, scale: 0.96 }}
                            transition={{ duration: 0.28, ease: "easeOut" }}
                            className="w-full max-w-sm overflow-hidden rounded-[2rem] bg-white p-6 shadow-2xl"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                                    🧳
                                </div>

                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">
                                        Smart packing
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold tracking-[-0.05em] text-neutral-950">
                                        Creating your packing list
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                                        We&apos;re tailoring your essentials to this trip.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                {[
                                    "Destination",
                                    "Weather forecast",
                                    "Trip duration",
                                ].map((label, index) => (
                                    <motion.div
                                        key={label}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: 0.15 + index * 0.18,
                                            duration: 0.3,
                                        }}
                                        className="flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3"
                                    >
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white">
                                            ✓
                                        </span>

                                        <span className="text-sm font-bold text-neutral-700">
                                            {label}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                {itemPendingRemove && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 18, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 420, damping: 32 }}
                            className="w-full max-w-sm rounded-[2rem] bg-white p-6 text-center shadow-2xl"
                        >
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
                                    onPointerDown={(event) => {
                                        event.preventDefault();
                                        setItemPendingRemove(null);
                                        setResetSwipeKey((current) => current + 1);
                                    }}
                                    className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-bold text-neutral-700"
                                >
                                    Keep it
                                </button>

                                <button
                                    onPointerDown={async (event) => {
                                        event.preventDefault();
                                        const item = itemPendingRemove;

                                        setItemPendingRemove(null);

                                        setItemsByList((current) => ({
                                            ...current,
                                            [item.packing_list_id]: (
                                                current[item.packing_list_id] ?? []
                                            ).filter((currentItem) => currentItem.id !== item.id),
                                        }));

                                        await hideItemOfflineAware({
                                            tripId,
                                            itemId: item.id,
                                        });
                                    }}
                                    className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-bold text-white"
                                >
                                    Remove
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                {listActionPending && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 18, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 18, scale: 0.96 }}
                            transition={{ duration: 0.18 }}
                            className="w-full max-w-sm rounded-[1.75rem] bg-white p-5 shadow-2xl"
                        >
                            <h2 className="text-xl font-bold tracking-[-0.03em] text-neutral-950">
                                {listActionPending.type === "delete"
                                    ? "Delete Kids List?"
                                    : listActionPending.list.title === "Kids List"
                                        ? "Reset Kids List?"
                                        : "Reset My List?"}
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-neutral-500">
                                {listActionPending.type === "delete"
                                    ? "This will remove the Kids List from this trip. You can create it again later from Personalize."
                                    : listActionPending.list.title === "Kids List"
                                        ? "This will restore the default kids packing recommendations. Any custom changes will be removed."
                                        : "This will regenerate your packing list using your current personalization settings. Any custom changes will be removed."}
                            </p>

                            <div className="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setListActionPending(null)}
                                    className="flex-1 rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-bold text-neutral-600"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={async () => {
                                        const action = listActionPending;
                                        if (!action) return;

                                        const list = action.list;
                                        const listId = list.id;

                                        setListActionPending(null);

                                        try {
                                            if (action.type === "delete") {
                                                await archivePackingList(listId);

                                                setLists((current) =>
                                                    current.filter((existing) => existing.id !== listId)
                                                );

                                                setItemsByList((current) => {
                                                    const next = { ...current };
                                                    delete next[listId];
                                                    return next;
                                                });

                                                setActiveListId((current) => {
                                                    if (current !== listId) return current;

                                                    const remaining = lists.filter(
                                                        (existing) => existing.id !== listId
                                                    );

                                                    return remaining[0]?.id ?? null;
                                                });

                                                return;
                                            }

                                            await hidePackingListItems(listId);

                                            const tripDays = trip
                                                ? calculateTripDays(trip.start_date, trip.end_date)
                                                : 1;

                                            const resetItems =
                                                list.title === "Kids List"
                                                    ? kidsStarterItems
                                                    : [
                                                        ...getEssentialsStarterItems(),
                                                        ...baseItems
                                                            .filter((item) =>
                                                                ["Clothing", "Toiletries", "Tech"].includes(
                                                                    item.category
                                                                )
                                                            )
                                                            .map((item) => ({
                                                                name: item.name,
                                                                category: item.category,
                                                                quantity: getPreferenceAdjustedQuantity({
                                                                    quantity: getLaundryAwareQuantity({
                                                                        item,
                                                                        tripDays,
                                                                        laundry,
                                                                    }),
                                                                    preference: packingPreference,
                                                                }),
                                                                source: "suggested" as const,
                                                                packed: false,
                                                                hidden: false,
                                                                protected: Boolean(item.protected),
                                                            })),
                                                    ];

                                            const createdItems = await createSuggestedPackingItems({
                                                packingListId: listId,
                                                items: resetItems,
                                            });

                                            setItemsByList((current) => ({
                                                ...current,
                                                [listId]: createdItems,
                                            }));

                                            setResetSwipeKey((current) => current + 1);
                                        } catch (error) {
                                            console.error(error);
                                            await loadPacking();
                                        }
                                    }}
                                    className="flex-1 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-bold text-white"
                                >
                                    {listActionPending.type === "delete" ? "Delete" : "Reset"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AddPackingCategoriesModal
                open={categoryModalOpen}
                packingListId={activeList?.id ?? ""}
                existingItems={activeList ? (itemsByList[activeList.id] ?? []) : []}
                tripDays={trip ? calculateTripDays(trip.start_date, trip.end_date) : 1}
                laundry={laundry}
                activities={activities}
                packingPreference={packingPreference}
                defaultWeather={[]}
                onClose={() => setCategoryModalOpen(false)}
                onCreated={(createdItems) => {
                    if (!activeList) return;

                    setItemsByList((current) => ({
                        ...current,
                        [activeList.id]: [
                            ...(current[activeList.id] ?? []),
                            ...createdItems,
                        ],
                    }));

                }}
                onItemsHidden={(itemIds) => {
                    if (!activeList) return;

                    setItemsByList((current) => ({
                        ...current,
                        [activeList.id]: (current[activeList.id] ?? []).filter(
                            (item) => !itemIds.includes(item.id)
                        ),
                    }));
                }}
            />
        </div>
    );
}