"use client";

import { useEffect, useMemo, useState } from "react";
import { createKey, type PackingItem } from "../packingSuggestions";
import { supabase } from "@/lib/supabase";
import {
    getTripWeatherSummary,
    TripWeatherSummary,
} from "../weatherIntelligence";
import { generatePackingItems } from "../packingEngine";
import {
    ClimateOption,
    EnvironmentOption,
    TripStyleOption,
} from "../tripProfiles";

export function usePackingList(tripId: number, activeProfileId?: string | null) {
    const [items, setItems] = useState<PackingItem[]>([]);
    const [deletedItem, setDeletedItem] = useState<PackingItem | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState(false);

    const [tripTitle, setTripTitle] = useState("Trip");
    const [tripDestination, setTripDestination] = useState("");
    const [tripDays, setTripDays] = useState(1);
    const [tripImageUrl, setTripImageUrl] = useState<string | null>(null);
    const [weatherSummary, setWeatherSummary] =
        useState<TripWeatherSummary | null>(null);

    const [packingProfileId, setPackingProfileId] = useState<string | null>(null);
    const [packingProfileName, setPackingProfileName] = useState("");
    const [packingProfileType, setPackingProfileType] = useState("");

    const [selectedClimates, setSelectedClimates] = useState<ClimateOption[]>([]);
    const [selectedEnvironments, setSelectedEnvironments] = useState<EnvironmentOption[]>([]);
    const [selectedTripStyles, setSelectedTripStyles] = useState<TripStyleOption[]>([]);

    const [loaded, setLoaded] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    const visibleItems = useMemo(() => {
        return items.filter((item) => !item.hidden);
    }, [items]);

    const packedCount = visibleItems.filter((item) => item.packed).length;
    const totalCount = visibleItems.length;
    const progress = totalCount === 0 ? 0 : Math.round((packedCount / totalCount) * 100);

    const groupedItems = useMemo(() => {
        return visibleItems.reduce<Record<string, PackingItem[]>>((groups, item) => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
            return groups;
        }, {});
    }, [visibleItems]);

    function toggleItem(itemKey: string) {
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.key === itemKey
                    ? { ...item, packed: !item.packed }
                    : item
            )
        );
    }

    function decreaseQuantity(itemKey: string) {
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.key === itemKey
                    ? {
                        ...item,
                        quantity: Math.max(1, item.quantity - 1),
                        protected: true,
                    }
                    : item
            )
        );
    }

    function increaseQuantity(itemKey: string) {
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.key === itemKey
                    ? {
                        ...item,
                        quantity: item.quantity + 1,
                        protected: true,
                    }
                    : item
            )
        );
    }

    function deleteItem(
        itemKey: string,
        options: { showUndo?: boolean } = { showUndo: true }
    ) {
        const itemToDelete = items.find((item) => item.key === itemKey);
        if (!itemToDelete) return;

        setItems((currentItems) =>
            currentItems.map((item) =>
                item.key === itemKey ? { ...item, hidden: true } : item
            )
        );

        if (!options.showUndo) return;

        setDeletedItem(itemToDelete);
        setDeleteSuccess(true);

        setTimeout(() => {
            setDeleteSuccess(false);
            setDeletedItem(null);
        }, 4000);
    }

    function undoDeleteItem() {
        if (!deletedItem) return;

        setItems((currentItems) =>
            currentItems.map((item) =>
                item.key === deletedItem.key ? { ...item, hidden: false } : item
            )
        );

        setDeletedItem(null);
        setDeleteSuccess(false);
    }

    function calculateTripDays(startDate?: string, endDate?: string) {
        if (!startDate || !endDate) return 1;

        const start = new Date(startDate);
        const end = new Date(endDate);

        const differenceInMs = end.getTime() - start.getTime();
        const days = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24)) + 1;

        return Math.max(days, 1);
    }

    async function loadTripOverview(tripId: number) {
        const { data: trip } = await supabase
            .from("trips")
            .select("title, destination, image_url, start_date, end_date")
            .eq("id", tripId)
            .single();

        if (trip?.title) setTripTitle(trip.title);
        if (trip?.image_url) setTripImageUrl(trip.image_url);

        if (trip?.destination) {
            setTripDestination(trip.destination);

            const summary = await getTripWeatherSummary(trip.destination);
            setWeatherSummary(summary);
        }

        setTripDays(calculateTripDays(trip?.start_date, trip?.end_date));
    }

    useEffect(() => {
        async function loadPackList() {
            if (!tripId) return;
            if (!activeProfileId) return;
            setLoaded(false);
            setHydrated(false);
            setPackingProfileId(null);
            setItems([]);

            await loadTripOverview(tripId);

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            let { data: profile } = await supabase
                .from("packing_profiles")
                .select("*")
                .eq("id", activeProfileId)
                .maybeSingle();
            if (!profile) return;

            setPackingProfileId(profile.id);
            setPackingProfileName(profile.name);
            setPackingProfileType(profile.type);

            setSelectedClimates(profile.selected_climates || []);
            setSelectedEnvironments(profile.selected_environments || []);
            setSelectedTripStyles(profile.selected_trip_styles || []);

            const { data: savedItems } = await supabase
                .from("packing_items")
                .select("*")
                .eq("packing_profile_id", profile.id)
                .order("created_at", { ascending: true });

            if (savedItems && savedItems.length > 0) {
                const uniqueItems = new Map<string, PackingItem>();

                savedItems.forEach((item) => {
                    const key = item.item_key || createKey(item.category, item.name);

                    uniqueItems.set(key, {
                        key,
                        name: item.name,
                        category: item.category,
                        packed: item.packed,
                        quantity: item.quantity || 1,
                        hidden: item.hidden || false,
                        protected: item.protected || false,
                        source:
                            item.source === "custom"
                                ? "custom"
                                : item.source === "personal"
                                    ? "personal"
                                    : "suggested",
                    });
                });

                setItems(Array.from(uniqueItems.values()));
            } else {
                setItems([]);
            }

            setLoaded(true);
        }

        loadPackList();
    }, [tripId, activeProfileId]);

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
            if (!loaded || !hydrated || !packingProfileId) return;

            const {
                data: { user },
            } = await supabase.auth.getUser();

            await supabase
                .from("packing_profiles")
                .update({
                    selected_climates: selectedClimates,
                    selected_environments: selectedEnvironments,
                    selected_trip_styles: selectedTripStyles,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", packingProfileId);

            if (items.length === 0) return;

            await supabase.from("packing_items").upsert(
                items.map((item) => ({
                    packing_profile_id: packingProfileId,
                    item_key: item.key,
                    template_key: item.source === "suggested" ? item.key : null,
                    name: item.name,
                    category: item.category,
                    packed: item.packed,
                    quantity: item.quantity,
                    source: item.source,
                    hidden: item.hidden || false,
                    protected: item.protected || false,
                    updated_by: user?.id || null,
                    updated_at: new Date().toISOString(),
                })),
                {
                    onConflict: "packing_profile_id,item_key",
                }
            );
        }

        savePackList();
    }, [
        items,
        selectedClimates,
        selectedEnvironments,
        selectedTripStyles,
        packingProfileId,
        loaded,
        hydrated,
    ]);

    return {
        items,
        setItems,

        packingListId: null,
        packingProfileId,
        packingProfileName,
        packingProfileType,

        selectedClimates,
        setSelectedClimates,
        selectedEnvironments,
        setSelectedEnvironments,
        selectedTripStyles,
        setSelectedTripStyles,

        loaded,
        hydrated,
        setHydrated,

        deletedItem,
        deleteSuccess,
        toggleItem,
        decreaseQuantity,
        increaseQuantity,
        deleteItem,
        undoDeleteItem,
        visibleItems,
        packedCount,
        totalCount,
        progress,
        groupedItems,

        tripTitle,
        tripDestination,
        tripDays,
        tripImageUrl,
        weatherSummary,
    };
}