"use client";

import { generatePackingItems } from "./packingEngine";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    climateOptions,
    environmentOptions,
    tripStyleOptions,
    ClimateOption,
    EnvironmentOption,
    TripStyleOption,
} from "./tripProfiles";
import {
    PackingItem,
    createKey,
} from "./packingSuggestions";
import {
    getTripWeatherSummary,
    TripWeatherSummary,
} from "./weatherIntelligence";

export default function PackListPage() {
    const params = useParams();
    const tripId = Number(params.id);

    const [packingListId, setPackingListId] = useState<string | null>(null);
    const [tripTitle, setTripTitle] = useState("Trip");
    const [tripDestination, setTripDestination] = useState("");
    const [tripDays, setTripDays] = useState(1);
    const [tripImageUrl, setTripImageUrl] = useState<string | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [items, setItems] = useState<PackingItem[]>([]);
    const [selectedClimates, setSelectedClimates] = useState<ClimateOption[]>([]);
    const [selectedEnvironments, setSelectedEnvironments] = useState<EnvironmentOption[]>([]);
    const [selectedTripStyles, setSelectedTripStyles] = useState<TripStyleOption[]>([]);
    const [newItemName, setNewItemName] = useState("");
    const [showAddItem, setShowAddItem] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [weatherSummary, setWeatherSummary] =
        useState<TripWeatherSummary | null>(null);
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    const [deletedItem, setDeletedItem] = useState<PackingItem | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [itemPendingDelete, setItemPendingDelete] = useState<PackingItem | null>(null);


    useEffect(() => {
        async function loadPackList() {
            const { data: trip } = await supabase
                .from("trips")
                .select("title, destination, image_url, start_date, end_date")
                .eq("id", tripId)
                .single();

            if (trip?.image_url) setTripImageUrl(trip.image_url);

            if (trip?.destination) {
                setTripDestination(trip.destination);

                const summary = await getTripWeatherSummary(trip.destination);
                setWeatherSummary(summary);
            }
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
                            selected_climates: [],
                            selected_trip_types: [],
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
            setSelectedClimates(list.selected_climates || []);
            const savedProfiles = list.selected_trip_types || [];

            setSelectedEnvironments(
                savedProfiles.filter((profile: string) =>
                    environmentOptions.includes(profile as any)
                )
            );

            setSelectedTripStyles(
                savedProfiles.filter((profile: string) =>
                    tripStyleOptions.includes(profile as any)
                )
            );

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
                        source:
                            item.source === "custom"
                                ? "custom"
                                : item.source === "personal"
                                    ? "personal"
                                    : "suggested",
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

        setItems((currentItems) =>
            generatePackingItems({
                selectedClimates,
                selectedEnvironments,
                selectedTripStyles,
                tripDays,
                currentItems,
            })
        );

        setHydrated(true);
    }, [
        selectedClimates,
        selectedEnvironments,
        selectedTripStyles,
        loaded,
        tripDays,
    ]);

    useEffect(() => {
        async function savePackList() {
            if (!loaded || !hydrated || !packingListId) return;

            await supabase
                .from("packing_lists")
                .update({
                    selected_climates: selectedClimates,
                    selected_trip_types: [
                        ...selectedEnvironments,
                        ...selectedTripStyles,
                    ],
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
    }, [
        items,
        selectedClimates,
        selectedEnvironments,
        selectedTripStyles,
        packingListId,
        loaded,
        hydrated,
    ]);

    const packedCount = items.filter((item) => item.packed).length;
    const totalCount = items.length;
    const progress = totalCount === 0 ? 0 : Math.round((packedCount / totalCount) * 100);
    const tripNights = Math.max(tripDays - 1, 0);

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
        setSelectedClimates([]);
        setSelectedEnvironments([]);
        setSelectedTripStyles([]);
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
                    }
                    : item
            )
        );
    }

    function toggleCategory(category: string) {
        setOpenCategories((current) => ({
            ...current,
            [category]: !(current[category] ?? true),
        }));
    }

    function deleteItem(
        itemKey: string,
        options: { showUndo?: boolean } = { showUndo: true }
    ) {
        const itemToDelete = items.find((item) => item.key === itemKey);

        if (!itemToDelete) return;

        setItems((currentItems) =>
            currentItems.filter((item) => item.key !== itemKey)
        );

        if (!options.showUndo) {
            setItemPendingDelete(null);
            return;
        }

        setDeletedItem(itemToDelete);
        setDeleteSuccess(true);

        setTimeout(() => {
            setDeleteSuccess(false);
            setDeletedItem(null);
        }, 4000);
    }

    function undoDeleteItem() {
        if (!deletedItem) return;

        setItems((currentItems) => [...currentItems, deletedItem]);
        setDeletedItem(null);
        setDeleteSuccess(false);
    }

    function toggleClimate(climate: ClimateOption) {
        setSelectedClimates((current) =>
            current.includes(climate)
                ? current.filter((item) => item !== climate)
                : [...current, climate]
        );
    }

    function toggleEnvironment(environment: EnvironmentOption) {
        setSelectedEnvironments((current) =>
            current.includes(environment)
                ? current.filter((item) => item !== environment)
                : [...current, environment]
        );
    }

    async function addCustomItem() {
        const trimmedName = newItemName.trim();
        if (!trimmedName) return;

        const newKey = createKey("Custom", trimmedName);

        const alreadyExists = items.some((item) => item.key === newKey);
        if (alreadyExists) return;

        setItems((currentItems) => [
            ...currentItems,
            {
                key: newKey,
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
            <div className="mx-auto mb-1 flex max-w-2xl">
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

                {!loaded && (
                    <div className="space-y-3 animate-pulse">
                        <div className="mb-5">
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="mt-4 h-8 w-56 rounded-full bg-white/70" />
                                    <div className="mt-3 h-4 w-28 rounded-full bg-white/60" />
                                </div>

                                <div className="mt-4 h-14 w-14 rounded-full bg-white/80 shadow-sm" />
                            </div>

                            <div className="h-48 rounded-[2rem] bg-white/70 shadow-[0_18px_50px_rgba(0,0,0,0.10)]" />
                        </div>

                        <div className="rounded-3xl bg-white/70 px-5 py-4 shadow-sm">
                            <div className="h-6 w-32 rounded-full bg-neutral-200/70" />
                            <div className="mt-2 h-4 w-44 rounded-full bg-neutral-100" />
                        </div>

                        <div className="rounded-3xl bg-white/70 px-5 py-4 shadow-sm">
                            <div className="h-6 w-36 rounded-full bg-neutral-200/70" />
                            <div className="mt-2 h-4 w-20 rounded-full bg-neutral-100" />

                            <div className="mt-3 divide-y divide-neutral-100 border-t border-neutral-100">
                                <div className="flex items-center gap-4 py-3">
                                    <div className="h-5 w-5 rounded-md bg-neutral-200" />
                                    <div className="h-4 flex-1 rounded-full bg-neutral-100" />
                                    <div className="h-6 w-20 rounded-full bg-neutral-100" />
                                </div>

                                <div className="flex items-center gap-4 py-3">
                                    <div className="h-5 w-5 rounded-md bg-neutral-200" />
                                    <div className="h-4 flex-1 rounded-full bg-neutral-100" />
                                    <div className="h-6 w-20 rounded-full bg-neutral-100" />
                                </div>

                                <div className="flex items-center gap-4 py-3">
                                    <div className="h-5 w-5 rounded-md bg-neutral-200" />
                                    <div className="h-4 flex-1 rounded-full bg-neutral-100" />
                                    <div className="h-6 w-20 rounded-full bg-neutral-100" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {loaded && (
                    <>
                        <div className="mb-5">
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="mt-4 text-2xl font-bold tracking-tight text-neutral-950">
                                        {tripDestination || tripTitle} Packing List
                                    </h1>

                                    <p className="mt-3 text-sm font-medium text-neutral-500">
                                        {tripDays} {tripDays === 1 ? "day" : "days"} · {tripNights}{" "}
                                        {tripNights === 1 ? "night" : "nights"}
                                    </p>
                                </div>

                                <div className="mt-4 flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-white shadow-sm">
                                    <span className="text-sm font-semibold text-rose-600">{progress}%</span>
                                    <span className="text-[11px] font-semibold text-neutral-500">
                                        {packedCount}/{totalCount}
                                    </span>
                                </div>
                            </div>

                            <div className="relative overflow-hidden rounded-[2rem] bg-neutral-200 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                                {tripImageUrl ? (
                                    <img
                                        src={tripImageUrl}
                                        alt={tripTitle}
                                        className="h-48 w-full object-cover"
                                    />
                                ) : (
                                    <img
                                        src="/illustrations/pack-list-hero.png"
                                        alt=""
                                        className="h-48 w-full object-cover"
                                    />
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                                {weatherSummary && (
                                    <div className="absolute bottom-5 left-5 text-white">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-bold">
                                                {weatherSummary.temperature !== null
                                                    ? `${Math.round(weatherSummary.temperature)}°`
                                                    : "—"}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs font-semibold">
                                            {weatherSummary.weatherLabel}
                                        </p>

                                        {weatherSummary.precipitationProbability !== null && (
                                            <p className="mt-2 text-sm">
                                                {weatherSummary.precipitationProbability}% rain chance
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-2 rounded-3xl bg-white px-5 py-4 shadow-sm">
                            <button
                                type="button"
                                onClick={() => setProfileOpen((open) => !open)}
                                className="flex w-full items-center justify-between gap-4 text-left"
                            >
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-950">Trip profile</h2>
                                    <p className="mt-1 text-sm text-neutral-500">
                                        {[...selectedClimates, ...selectedEnvironments].length > 0
                                            ? [...selectedClimates, ...selectedEnvironments].join(" · ")
                                            : "Choose climate and trip style"}
                                    </p>
                                </div>

                                <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-semibold text-neutral-700">
                                    {profileOpen ? "Done" : "Edit"}
                                </span>
                            </button>

                            {profileOpen && (
                                <div className="mt-5">
                                    {weatherSummary && weatherSummary.suggestedProfiles.length > 0 && (
                                        <div className="mb-5 rounded-2xl bg-rose-50 p-4">
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
                                                Suggested by weather
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {weatherSummary.suggestedProfiles.map((profile) => (
                                                    <span
                                                        key={profile}
                                                        className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-rose-500 shadow-sm"
                                                    >
                                                        {profile}
                                                    </span>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedClimates((current) => [
                                                        ...new Set([...current, ...weatherSummary.suggestedProfiles]),
                                                    ]);
                                                }}
                                                className="mt-3 w-full rounded-2xl bg-rose-500 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98]"
                                            >
                                                Apply weather suggestions
                                            </button>
                                        </div>
                                    )}

                                    <h3 className="mb-3 text-sm font-bold text-neutral-950">
                                        Climate
                                    </h3>

                                    <div className="flex flex-wrap gap-2">
                                        {climateOptions.map((climate) => {
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
                                        Environment
                                    </h3>

                                    <div className="flex flex-wrap gap-2">
                                        {environmentOptions.map((environment) => {
                                            const active = selectedEnvironments.includes(environment);

                                            return (
                                                <button
                                                    key={environment}
                                                    type="button"
                                                    onClick={() => toggleEnvironment(environment)}
                                                    className={
                                                        active
                                                            ? "rounded-full bg-rose-500 px-3.5 py-1.5 text-sm font-semibold text-white"
                                                            : "rounded-full bg-neutral-100 px-3.5 py-1.5 text-sm font-medium text-neutral-700"
                                                    }
                                                >
                                                    {environment}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <h3 className="mb-3 mt-5 text-sm font-bold text-neutral-950">
                                        Trip style
                                    </h3>

                                    <div className="flex flex-wrap gap-2">
                                        {tripStyleOptions.map((style) => {
                                            const active = selectedTripStyles.includes(style);

                                            return (
                                                <button
                                                    key={style}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedTripStyles((current) =>
                                                            current.includes(style)
                                                                ? current.filter((item) => item !== style)
                                                                : [...current, style]
                                                        );
                                                    }}
                                                    className={
                                                        active
                                                            ? "rounded-full bg-rose-500 px-3.5 py-1.5 text-sm font-semibold text-white"
                                                            : "rounded-full bg-neutral-100 px-3.5 py-1.5 text-sm font-medium text-neutral-700"
                                                    }
                                                >
                                                    {style}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={resetPackList}
                                        className="mt-10 w-full rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-bold text-neutral-700 transition active:scale-[0.98]"
                                    >
                                        Reset pack list
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 pb-24">
                            {Object.entries(groupedItems).map(([category, categoryItems]) => {
                                const isOpen = openCategories[category] ?? true;
                                const packedInCategory = categoryItems.filter((item) => item.packed).length;
                                const totalInCategory = categoryItems.length;

                                return (
                                    <div key={category} className="rounded-3xl bg-white px-5 py-4 shadow-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={() => toggleCategory(category)}
                                                className="flex flex-1 items-center justify-between gap-4 text-left"
                                            >
                                                <div>
                                                    <h2 className="text-lg font-bold text-neutral-950">{category}</h2>

                                                    <p className="mt-1 text-xs font-semibold text-neutral-400">
                                                        {packedInCategory} / {totalInCategory} packed
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-500">
                                                        {Math.round((packedInCategory / totalInCategory) * 100)}%
                                                    </div>

                                                    <img
                                                        src="/icons/chevron-down.svg"
                                                        alt=""
                                                        className={
                                                            isOpen
                                                                ? "h-5 w-5 text-neutral-400 transition-transform"
                                                                : "h-5 w-5 rotate-[-90deg] text-neutral-400 transition-transform"
                                                        }
                                                    />
                                                </div>
                                            </button>
                                        </div>

                                        {isOpen && (
                                            <div className="mt-2 divide-y divide-neutral-100 border-t border-neutral-100">
                                                {categoryItems.map((item) => {

                                                    return (
                                                        <div key={item.key} className="relative overflow-hidden">
                                                            <div className="absolute inset-0 flex items-center justify-end rounded-2xl bg-red-500 px-5 text-sm font-bold text-white">
                                                                Delete
                                                            </div>

                                                            <motion.div
                                                                drag="x"
                                                                dragDirectionLock
                                                                dragConstraints={{ left: -120, right: 0 }}
                                                                dragElastic={0.08}
                                                                whileTap={{ scale: 0.99 }}
                                                                onDragEnd={(_, info) => {
                                                                    if (info.offset.x < -80 || info.velocity.x < -500) {
                                                                        deleteItem(item.key);
                                                                    }
                                                                }}
                                                                className="relative flex touch-pan-y items-center gap-4 bg-white px-1 py-3"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={item.packed}
                                                                    onChange={() => toggleItem(item.key)}
                                                                    onPointerDown={(event) => event.stopPropagation()}
                                                                    className="h-4 w-4 rounded-md border-neutral-300"
                                                                />

                                                                <div className="flex flex-1 items-center justify-between gap-3">
                                                                    <div>
                                                                        <span
                                                                            className={
                                                                                item.packed
                                                                                    ? "text-neutral-400 line-through"
                                                                                    : "text-neutral-800"
                                                                            }
                                                                        >
                                                                            {item.name}
                                                                        </span>
                                                                    </div>

                                                                    <div
                                                                        className="flex items-center gap-2"
                                                                        onPointerDown={(event) => event.stopPropagation()}
                                                                    >
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                if (item.quantity <= 1) {
                                                                                    setItemPendingDelete(item);

                                                                                    return;
                                                                                }

                                                                                setItems((currentItems) =>
                                                                                    currentItems.map((currentItem) =>
                                                                                        currentItem.key === item.key
                                                                                            ? {
                                                                                                ...currentItem,
                                                                                                quantity: currentItem.quantity - 1,
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
                                                                            className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-700 transition active:scale-95"
                                                                        >
                                                                            +
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {itemPendingDelete && (
                            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-6">
                                <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 text-center shadow-2xl">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-2xl">
                                        🧳
                                    </div>

                                    <h2 className="text-xl font-bold text-neutral-950">
                                        Remove item?
                                    </h2>

                                    <p className="mt-2 text-sm text-neutral-500">
                                        Remove “{itemPendingDelete.name}” from your pack list?
                                    </p>

                                    <div className="mt-6">
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setItemPendingDelete(null)}
                                                className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-bold text-neutral-700"
                                            >
                                                Keep it
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    deleteItem(itemPendingDelete.key, { showUndo: false });
                                                }}
                                                className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-bold text-white"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {deleteSuccess && deletedItem && (
                            <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 pointer-events-none">
                                <div className="toast-in pointer-events-auto flex w-full max-w-sm items-center gap-4 rounded-[1.75rem] border border-white/70 bg-white/95 px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-xl">
                                        🧳
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-neutral-950">
                                            Removed “{deletedItem.name}”
                                        </p>

                                        <p className="mt-0.5 text-xs font-medium text-neutral-500">
                                            Item removed from this trip.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={undoDeleteItem}
                                        className="shrink-0 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-rose-500 transition active:scale-95"
                                    >
                                        Undo
                                    </button>
                                </div>
                            </div>
                        )}

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

                                <div className="relative w-full rounded-t-3xl bg-white px-5 py-5 shadow-2xl">
                                    <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-neutral-300" />

                                    <h2 className="text-2xl font-bold text-neutral-950">Add packing item</h2>

                                    <input
                                        value={newItemName}
                                        onChange={(event) => setNewItemName(event.target.value)}
                                        placeholder="Example: GoPro battery"
                                        className="mt-5 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-base outline-none"
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
                    </>
                )}
            </div>
        </main>
    );
}