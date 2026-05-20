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
    tripTypeSuggestions,
} from "./packingSuggestions";

export default function PackListPage() {
    const params = useParams();
    const tripId = Number(params.id);

    const [packingListId, setPackingListId] = useState<string | null>(null);
    const [tripTitle, setTripTitle] = useState("Trip");
    const [items, setItems] = useState<PackingItem[]>(baseItems);
    const [selectedClimates, setSelectedClimates] = useState<string[]>(["Tropical"]);
    const [selectedTripTypes, setSelectedTripTypes] = useState<string[]>(["Beach"]);
    const [newItemName, setNewItemName] = useState("");
    const [showAddItem, setShowAddItem] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        async function loadPackList() {
            const { data: trip } = await supabase
                .from("trips")
                .select("title")
                .eq("id", tripId)
                .single();

            if (trip?.title) setTripTitle(trip.title);

            let { data: list } = await supabase
                .from("packing_lists")
                .select("*")
                .eq("trip_id", tripId)
                .maybeSingle();

            if (!list) {
                const { data: newList, error } = await supabase
                    .from("packing_lists")
                    .insert({
                        trip_id: tripId,
                        selected_climates: ["Tropical"],
                        selected_trip_types: ["Beach"],
                    })
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
        ];

        setItems((currentItems) => {
            const customItems = currentItems.filter((item) => item.source === "custom");

            const preservedGeneratedItems = generatedItems.map((generatedItem) => {
                const existingItem = currentItems.find((item) => item.key === generatedItem.key);
                return existingItem ? { ...generatedItem, packed: existingItem.packed } : generatedItem;
            });

            return [...preservedGeneratedItems, ...customItems];
        });
    }, [selectedClimates, selectedTripTypes, loaded]);

    useEffect(() => {
        async function savePackList() {
            if (!loaded || !packingListId) return;

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
                        source: item.source,
                    }))
                );
            }
        }

        savePackList();
    }, [items, selectedClimates, selectedTripTypes, packingListId, loaded]);

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

    function toggleItem(itemKey: string) {
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.key === itemKey ? { ...item, packed: !item.packed } : item
            )
        );
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
                key: crypto.randomUUID(),
                name: trimmedName,
                category: "Custom",
                packed: false,
                quantity: 1,
                source: "custom",
            },
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

                    <p className="mt-2 text-neutral-500">Suggestions adapt to your trip.</p>
                </div>

                <div className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-lg font-bold text-neutral-950">Climate</h2>

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
                                            ? "rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white"
                                            : "rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700"
                                    }
                                >
                                    {climate}
                                </button>
                            );
                        })}
                    </div>

                    <h2 className="mb-3 mt-6 text-lg font-bold text-neutral-950">Trip style</h2>

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
                                            ? "rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white"
                                            : "rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700"
                                    }
                                >
                                    {type}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500">Packing progress</p>
                            <h2 className="text-3xl font-bold text-neutral-950">
                                {packedCount} / {totalCount}
                            </h2>
                        </div>

                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-500 text-xl font-bold text-white">
                            {progress}%
                        </div>
                    </div>
                </div>

                <div className="space-y-5 pb-24">
                    {Object.entries(groupedItems).map(([category, categoryItems]) => (
                        <div key={category} className="rounded-3xl bg-white p-5 shadow-sm">
                            <h2 className="mb-4 text-xl font-bold text-neutral-950">{category}</h2>

                            <div className="space-y-3">
                                {categoryItems.map((item) => (
                                    <label
                                        key={item.key}
                                        className="flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={item.packed}
                                            onChange={() => toggleItem(item.key)}
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

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.preventDefault();

                                                        setItems((currentItems) =>
                                                            currentItems.map((currentItem) =>
                                                                currentItem.key === item.key
                                                                    ? {
                                                                        ...currentItem,
                                                                        quantity: Math.max(1, currentItem.quantity - 1),
                                                                    }
                                                                    : currentItem
                                                            )
                                                        );
                                                    }}
                                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-sm font-bold text-neutral-700"
                                                >
                                                    −
                                                </button>

                                                <span className="min-w-[24px] text-center text-sm font-semibold text-neutral-700">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.preventDefault();

                                                        setItems((currentItems) =>
                                                            currentItems.map((currentItem) =>
                                                                currentItem.key === item.key
                                                                    ? {
                                                                        ...currentItem,
                                                                        quantity: currentItem.quantity + 1,
                                                                    }
                                                                    : currentItem
                                                            )
                                                        );
                                                    }}
                                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {showAddItem && (
                    <div className="fixed inset-0 z-50 flex items-end bg-black/40">
                        <button
                            type="button"
                            aria-label="Close add item"
                            className="absolute inset-0"
                            onClick={() => setShowAddItem(false)}
                        />

                        <div className="relative w-full rounded-t-[2rem] bg-[#faf7ef] p-5 shadow-2xl">
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
                    className="fixed bottom-6 right-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-3xl text-white shadow-xl transition active:scale-95"
                >
                    +
                </button>
            </div>
        </main>
    );
}