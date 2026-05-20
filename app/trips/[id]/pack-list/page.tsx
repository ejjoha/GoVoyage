"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    PackingItem,
    baseItems,
    climateSuggestions,
    createKey,
    getSmartQuantity,
    tripTypeSuggestions,
} from "./packingSuggestions";

export default function PackListPage() {
    const params = useParams();
    const tripId = Number(params.id);

    const [packingListId, setPackingListId] = useState<string | null>(null);
    const [tripTitle, setTripTitle] = useState("Trip");
    const [tripDays, setTripDays] = useState(1);
    const [profileOpen, setProfileOpen] = useState(false);
    const [items, setItems] = useState<PackingItem[]>([]);
    const [selectedClimates, setSelectedClimates] = useState<string[]>(["Tropical"]);
    const [selectedTripTypes, setSelectedTripTypes] = useState<string[]>(["Beach"]);
    const [newItemName, setNewItemName] = useState("");
    const [showAddItem, setShowAddItem] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const [draggingItemKey, setDraggingItemKey] = useState<string | null>(null);
    const [dragStartX, setDragStartX] = useState<number | null>(null);
    const [dragOffset, setDragOffset] = useState(0);
    const [resetSuccess, setResetSuccess] = useState(false);

    useEffect(() => {
        async function loadPackList() {
            const { data: trip } = await supabase
                .from("trips")
                .select("title, start_date, end_date")
                .eq("id", tripId)
                .single();

            if (trip?.title) setTripTitle(trip.title);
            setTripDays(calculateTripDays(trip?.start_date, trip?.end_date));

            let { data: list } = await supabase
                .from("packing_lists")
                .select("*")
                .eq("trip_id", tripId)
                .maybeSingle();

            if (!list) {
                const { data: newList, error } = await supabase
                    .from("packing_lists")
                    .upsert(
                        {
                            trip_id: tripId,
                            selected_climates: ["Tropical"],
                            selected_trip_types: ["Beach"],
                        },
                        { onConflict: "trip_id" }
                    )
                    .select("*")
                    .single();

                if (error) {
                    console.error(error);
                    return;
                }

                list = newList;
            }

            setPackingListId(list.id);
            setSelectedClimates(list.selected_climates || ["Tropical"]);
            setSelectedTripTypes(list.selected_trip_types || ["Beach"]);

            const { data: savedItems } = await supabase
                .from("packing_items")
                .select("*")
                .eq("packing_list_id", list.id)
                .order("created_at", { ascending: true });

            if (savedItems && savedItems.length > 0) {
                const uniqueItems = new Map<string, PackingItem>();

                savedItems.forEach((item) => {
                    const key = createKey(item.category, item.name);

                    uniqueItems.set(key, {
                        key,
                        name: item.name,
                        category: item.category,
                        packed: item.packed,
                        quantity: item.quantity || 1,
                        source: item.source === "custom" ? "custom" : "suggested",
                    });
                });

                setItems(Array.from(uniqueItems.values()));
            }

            setLoaded(true);
        }

        if (tripId) loadPackList();
    }, [tripId]);

    useEffect(() => {
        if (!loaded) return;

        const generatedItems = [
            ...baseItems,
            ...selectedClimates.flatMap((climate) => climateSuggestions[climate] || []),
            ...selectedTripTypes.flatMap((type) => tripTypeSuggestions[type] || []),
        ].map((item) => ({
            ...item,
            key: createKey(item.category, item.name),
            quantity: getSmartQuantity(item, tripDays),
        }));

        setItems((currentItems) => {
            const preservedItems = currentItems.filter(
                (item) => item.source === "custom" || item.protected || item.packed
            );

            const preservedGeneratedItems = generatedItems.map((generatedItem) => {
                const existingItem = currentItems.find(
                    (item) => createKey(item.category, item.name) === createKey(generatedItem.category, generatedItem.name)
                );
                return existingItem
                    ? {
                        ...generatedItem,
                        packed: existingItem.packed,
                        quantity: existingItem.quantity,
                        protected: existingItem.protected || existingItem.packed,
                    }
                    : generatedItem;
            });

            const mergedItems = [...preservedGeneratedItems];

            preservedItems.forEach((preservedItem) => {
                const alreadyExists = mergedItems.some(
                    (item) => item.key === preservedItem.key
                );

                if (!alreadyExists) {
                    mergedItems.push(preservedItem);
                }
            });

            return mergedItems;
        });
        setHydrated(true);
    }, [selectedClimates, selectedTripTypes, loaded]);

    useEffect(() => {
        async function savePackList() {
            if (!loaded || !hydrated || !packingListId) return;

            await supabase
                .from("packing_lists")
                .update({
                    selected_climates: selectedClimates,
                    selected_trip_types: selectedTripTypes,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", packingListId);

            await supabase.from("packing_items").delete().eq("packing_list_id", packingListId);

            if (items.length > 0) {
                await supabase.from("packing_items").insert(
                    items.map((item) => ({
                        packing_list_id: packingListId,
                        name: item.name,
                        category: item.category,
                        packed: item.packed,
                        quantity: item.quantity,
                        source: item.source,
                    }))
                );
            }
        }

        savePackList();
    }, [items, selectedClimates, selectedTripTypes, packingListId, loaded, hydrated]);

    const packedCount = items.filter((item) => item.packed).length;
    const totalCount = items.length;
    const progress = totalCount === 0 ? 0 : Math.round((packedCount / totalCount) * 100);

    const groupedItems = useMemo(() => {
        return items.reduce<Record<string, PackingItem[]>>((groups, item) => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
            return groups;
        }, {});
    }, [items]);

    function calculateTripDays(startDate?: string, endDate?: string) {
        if (!startDate || !endDate) return 1;

        const start = new Date(startDate);
        const end = new Date(endDate);

        const differenceInMs = end.getTime() - start.getTime();
        const days = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24)) + 1;

        return Math.max(days, 1);
    }

    function resetPackList() {
        setSelectedClimates(["Tropical"]);
        setSelectedTripTypes(["Beach"]);
        setItems([]);
        setHydrated(false);

        setResetSuccess(true);

        setTimeout(() => {
            setHydrated(true);
        }, 0);

        setTimeout(() => {
            setResetSuccess(false);
        }, 2200);
    }

    function toggleItem(itemKey: string) {
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.key === itemKey
                    ? {
                        ...item,
                        packed: !item.packed,
                        protected: true,
                    }
                    : item
            )
        );
    }

    function deleteItem(itemKey: string) {
        setItems((currentItems) =>
            currentItems.filter((item) => item.key !== itemKey)
        );
    }

    function startSwipe(clientX: number, itemKey: string) {
        setDraggingItemKey(itemKey);
        setDragStartX(clientX);
        setDragOffset(0);
    }

    function moveSwipe(clientX: number) {
        if (dragStartX === null) return;

        const offset = clientX - dragStartX;

        if (offset < 0) {
            setDragOffset(Math.max(offset, -110));
        }
    }

    function endSwipe(itemKey: string) {
        if (dragOffset < -80) {
            deleteItem(itemKey);
        }

        setDraggingItemKey(null);
        setDragStartX(null);
        setDragOffset(0);
    }

    function toggleClimate(climate: string) {
        setSelectedClimates((current) =>
            current.includes(climate)
                ? current.filter((item) => item !== climate)
                : [...current, climate]
        );
    }

    function toggleTripType(type: string) {
        setSelectedTripTypes((current) =>
            current.includes(type)
                ? current.filter((item) => item !== type)
                : [...current, type]
        );
    }

    function addCustomItem() {
        const trimmedName = newItemName.trim();
        if (!trimmedName) return;

        setItems((currentItems) => [
            ...currentItems,
            {
                key: createKey("Custom", trimmedName),
                name: trimmedName,
                category: "Custom",
                packed: false,
                quantity: 1,
                source: "custom",
            }
        ]);

        setNewItemName("");
        setShowAddItem(false);
    }

    return (
        <main className="min-h-screen bg-[#f6f1e8] px-4 py-6">
            <div className="mx-auto mb-4 flex max-w-2xl">
                <Link
                    href={`/trips/${tripId}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition active:scale-95"
                    aria-label="Back"
                >
                    <img
                        src="/icons/arrow-left.svg"
                        alt=""
                        className="h-5 w-5 opacity-80"
                    />
                </Link>
            </div>
            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
                        Smart Pack List
                    </p>

                    <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-950">
                        {tripTitle} Packing
                    </h1>

                    <p className="mt-2 text-neutral-500">
                        Suggestions adapt to your trip length: {tripDays} days.
                    </p>
                </div>

                <div className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
                    <button
                        type="button"
                        onClick={() => setProfileOpen((open) => !open)}
                        className="flex w-full items-center justify-between gap-4 text-left"
                    >
                        <div>
                            <h2 className="text-lg font-bold text-neutral-950">Trip profile</h2>
                            <p className="mt-1 text-sm text-neutral-500">
                                {[...selectedClimates, ...selectedTripTypes].join(" · ")}
                            </p>
                        </div>

                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-semibold text-neutral-700">
                            {profileOpen ? "Done" : "Edit"}
                        </span>
                    </button>

                    {profileOpen && (
                        <div className="mt-5">
                            <h3 className="mb-3 text-sm font-bold text-neutral-950">Climate</h3>

                            <div className="flex flex-wrap gap-2">
                                {["Tropical", "Cold", "Mountain"].map((climate) => {
                                    const active = selectedClimates.includes(climate);

                                    return (
                                        <button
                                            key={climate}
                                            type="button"
                                            onClick={() => toggleClimate(climate)}
                                            className={
                                                active
                                                    ? "rounded-full bg-rose-500 px-3.5 py-1.5 text-sm font-semibold text-white"
                                                    : "rounded-full bg-neutral-100 px-3.5 py-1.5 text-sm font-medium text-neutral-700"
                                            }
                                        >
                                            {climate}
                                        </button>
                                    );
                                })}
                            </div>

                            <h3 className="mb-3 mt-5 text-sm font-bold text-neutral-950">
                                Trip style
                            </h3>

                            <div className="flex flex-wrap gap-2">
                                {["Beach", "Hiking", "City"].map((type) => {
                                    const active = selectedTripTypes.includes(type);

                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => toggleTripType(type)}
                                            className={
                                                active
                                                    ? "rounded-full bg-rose-500 px-3.5 py-1.5 text-sm font-semibold text-white"
                                                    : "rounded-full bg-neutral-100 px-3.5 py-1.5 text-sm font-medium text-neutral-700"
                                            }
                                        >
                                            {type}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                type="button"
                                onClick={resetPackList}
                                className="mt-5 w-full rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-bold text-neutral-700 transition active:scale-[0.98]"
                            >
                                Reset pack list
                            </button>
                        </div>
                    )}
                </div>

                <div className="mb-6 rounded-3xl bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500">Packing progress</p>
                            <h2 className="text-2xl font-bold text-neutral-950">
                                {loaded ? `${packedCount} / ${totalCount}` : "Loading"}
                            </h2>
                        </div>

                        <div className="flex h-15 w-15 items-center justify-center rounded-full bg-rose-500 text-lg font-bold text-white">
                            {loaded ? `${progress}%` : "…"}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pb-24">
                    {Object.entries(groupedItems).map(([category, categoryItems]) => (
                        <div key={category} className="rounded-3xl bg-white p-4 shadow-sm">
                            <h2 className="mb-4 text-lg font-bold text-neutral-950">{category}</h2>

                            <div className="space-y-3">
                                {categoryItems.map((item) => {
                                    const isDragging = draggingItemKey === item.key;
                                    const offset = isDragging ? dragOffset : 0;

                                    return (
                                        <div key={item.key} className="relative overflow-hidden rounded-2xl">
                                            <div className="absolute inset-0 flex items-center justify-end rounded-2xl bg-red-500 px-5 text-sm font-bold text-white">
                                                Delete
                                            </div>

                                            <div
                                                onPointerDown={(event) => startSwipe(event.clientX, item.key)}
                                                onPointerMove={(event) => moveSwipe(event.clientX)}
                                                onPointerUp={() => endSwipe(item.key)}
                                                onPointerCancel={() => endSwipe(item.key)}
                                                style={{
                                                    transform: `translateX(${offset}px)`,
                                                }}
                                                className="relative flex touch-pan-y items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-2.5 transition-transform"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={item.packed}
                                                    onChange={() => toggleItem(item.key)}
                                                    onPointerDown={(event) => event.stopPropagation()}
                                                    className="h-5 w-5 rounded border-neutral-300"
                                                />

                                                <div className="flex flex-1 items-center justify-between gap-3">
                                                    <span
                                                        className={
                                                            item.packed
                                                                ? "text-neutral-400 line-through"
                                                                : "text-neutral-800"
                                                        }
                                                    >
                                                        {item.name}
                                                    </span>

                                                    <div
                                                        className="flex items-center gap-2"
                                                        onPointerDown={(event) => event.stopPropagation()}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setItems((currentItems) =>
                                                                    currentItems.map((currentItem) =>
                                                                        currentItem.key === item.key
                                                                            ? {
                                                                                ...currentItem,
                                                                                quantity: Math.max(1, currentItem.quantity - 1),
                                                                                protected: true,
                                                                            }
                                                                            : currentItem
                                                                    )
                                                                );
                                                            }}
                                                            className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-700 transition active:scale-95"
                                                        >
                                                            −
                                                        </button>

                                                        <span className="min-w-[22px] rounded-full bg-neutral-100 px-2 py-1 text-center text-xs font-semibold text-neutral-700">
                                                            {item.quantity}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setItems((currentItems) =>
                                                                    currentItems.map((currentItem) =>
                                                                        currentItem.key === item.key
                                                                            ? {
                                                                                ...currentItem,
                                                                                quantity: currentItem.quantity + 1,
                                                                                protected: true,
                                                                            }
                                                                            : currentItem
                                                                    )
                                                                );
                                                            }}
                                                            className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white transition active:scale-95"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {resetSuccess && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/10 px-6 pointer-events-none">
                        <div className="toast-in pointer-events-auto w-full max-w-sm rounded-[2rem] border border-white/70 bg-white/90 px-6 py-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.20)] backdrop-blur-xl">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-2xl shadow-sm">
                                ✓
                            </div>

                            <p className="text-lg font-semibold tracking-[-0.02em] text-stone-900">
                                Pack list reset
                            </p>

                            <p className="mt-1 text-sm text-stone-500">
                                Your smart suggestions have been refreshed.
                            </p>
                        </div>
                    </div>
                )}

                {showAddItem && (
                    <div className="fixed inset-0 z-50 flex items-end bg-black/40">
                        <button
                            type="button"
                            aria-label="Close add item"
                            className="absolute inset-0"
                            onClick={() => setShowAddItem(false)}
                        />

                        <div className="relative w-full rounded-t-[2rem] bg-[#faf7ef] p-4 shadow-2xl">
                            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-neutral-300" />

                            <h2 className="text-2xl font-bold text-neutral-950">Add packing item</h2>

                            <input
                                value={newItemName}
                                onChange={(event) => setNewItemName(event.target.value)}
                                placeholder="Example: GoPro battery"
                                className="mt-5 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-base outline-none"
                                autoFocus
                            />

                            <button
                                type="button"
                                onClick={addCustomItem}
                                className="mt-4 w-full rounded-2xl bg-rose-500 px-5 py-4 font-bold text-white shadow-sm transition active:scale-[0.98]"
                            >
                                Add item
                            </button>
                        </div>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setShowAddItem(true)}
                    className="fixed bottom-6 right-6 flex h-13 w-13 items-center justify-center rounded-full bg-rose-500 text-3xl text-white shadow-xl transition active:scale-95"
                >
                    +
                </button>
            </div>
        </main>
    );
}