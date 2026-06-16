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
import { usePackingData } from "../hooks/use-packing-data";
import { usePackingPreferences } from "../hooks/use-packing-preferences";

import type {
    PackingList,
    PackingListItem,
} from "../types/packing.types";

import {
    archivePackingList,
    getOrCreateMyPackingList,
    createSuggestedPackingItems,
    hidePackingListItems,
} from "../lib/packing-mutations";

import {
    appendItemToList,
    appendItemsToList,
    removeItemFromList,
    removeItemsFromList,
    removeListFromItemsByList,
    replaceListItems,
    updateItemInList,
} from "../lib/packing-state";

import PackingNextActions from "./packing-next-actions";

import {
    baseItems,
    getEssentialsStarterItems,
    getLaundryAwareQuantity,
    getPreferenceAdjustedQuantity,
} from "../lib/packing-template-engine";

import {
    togglePackedOfflineAware,
    updateQuantityOfflineAware,
    hideItemOfflineAware,
} from "../lib/packing-offline-service";

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

    const {
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
    } = usePackingData({
        tripId,
        requestedListId,
    });
    const [initializingFirstList, setInitializingFirstList] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const {
        laundry,
        packingPreference,
        activities,
    } = usePackingPreferences({
        tripId,
        categoryModalOpen,
    });
    const [itemPendingRemove, setItemPendingRemove] =
        useState<PackingListItem | null>(null);
    const [listActionPending, setListActionPending] =
        useState<{
            type: "reset" | "delete";
            list: PackingList;
        } | null>(null);

    const [resetSwipeKey, setResetSwipeKey] = useState(0);


    async function initializeFirstPackingList() {
        if (initializingFirstList) return;

        setInitializingFirstList(true);

        const startedAt = Date.now();

        try {
            const list = await getOrCreateMyPackingList({
                tripId,
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
                            laundry: "Not available",
                        }),
                        preference: "Balanced",
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

            setLists((current) => {
                const exists = current.some((existingList) => existingList.id === list.id);

                if (exists) {
                    return current;
                }

                return [list, ...current];
            });

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
        if (
            !loading &&
            hasCheckedServer &&
            lists.length === 0 &&
            trip &&
            !initializingFirstList
        ) {
            initializeFirstPackingList();
        }
    }, [
        loading,
        hasCheckedServer,
        lists.length,
        trip,
        initializingFirstList,
    ]);

    const allItems = useMemo(
        () => Object.values(itemsByList).flat(),
        [itemsByList]
    );

    const packedCount = allItems.filter((item) => item.packed).length;
    const totalCount = allItems.length;
    const activeList = lists.find((list) => list.id === activeListId) ?? lists[0] ?? null;

    async function handleToggleItem(item: PackingListItem) {
        const nextPacked = !item.packed;
        const now = new Date().toISOString();

        setItemsByList((current) =>
            updateItemInList(current, item.packing_list_id, item.id, {
                packed: nextPacked,
                packed_at: nextPacked ? now : null,
                updated_at: now,
            })
        );

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
                            setItemsByList((current) =>
                                replaceListItems(current, list.id, createdItems)
                            );
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
                            setItemsByList((current) =>
                                appendItemToList(current, listId, item)
                            );
                        }}
                        onDecreaseQuantity={async (item) => {
                            if (item.quantity <= 1) {
                                setItemPendingRemove(item);
                                return;
                            }

                            const nextQuantity = Math.max(1, item.quantity - 1);
                            const now = new Date().toISOString();

                            setItemsByList((current) =>
                                updateItemInList(current, item.packing_list_id, item.id, {
                                    quantity: nextQuantity,
                                    updated_at: now,
                                })
                            );

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

                            setItemsByList((current) =>
                                updateItemInList(current, item.packing_list_id, item.id, {
                                    quantity: nextQuantity,
                                    updated_at: now,
                                })
                            );

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
                            setItemsByList((current) =>
                                appendItemToList(current, activeList.id, item)
                            );
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

                                        setItemsByList((current) =>
                                            removeItemFromList(current, item.packing_list_id, item.id)
                                        );

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
                                        : "This will reset your personalization choices and restore the default packing list. Any custom changes will be removed."}
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

                                                setItemsByList((current) =>
                                                    removeListFromItemsByList(current, listId)
                                                );

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

                                            const isKidsList = list.title === "Kids List";

                                            if (!isKidsList) {
                                                localStorage.removeItem(`packing-activities-${tripId}`);
                                                localStorage.removeItem(`packing-climate-${tripId}`);
                                                localStorage.removeItem(`packing-laundry-${tripId}`);
                                                localStorage.removeItem(`packing-preference-${tripId}`);
                                            }

                                            const tripDays = trip
                                                ? calculateTripDays(trip.start_date, trip.end_date)
                                                : 1;

                                            const resetItems =
                                                isKidsList
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
                                                                        laundry: "Not available",
                                                                    }),
                                                                    preference: "Balanced",
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

                                            setItemsByList((current) =>
                                                replaceListItems(current, listId, createdItems)
                                            );

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
                    setItemsByList((current) =>
                        appendItemsToList(current, activeList.id, createdItems)
                    );
                }}
                onItemsHidden={(itemIds) => {
                    if (!activeList) return;

                    setItemsByList((current) =>
                        removeItemsFromList(current, activeList.id, itemIds)
                    );
                }}
            />
        </div>
    );
}