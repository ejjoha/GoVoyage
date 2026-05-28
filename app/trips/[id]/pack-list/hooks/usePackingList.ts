"use client";

import { useEffect, useMemo, useState } from "react";
import {
    createKey,
    type PackingItem,
} from "../packingSuggestions";
import { supabase } from "@/lib/supabase";
import {
    getTripWeatherSummary,
    TripWeatherSummary,
} from "../weatherIntelligence";
import { generatePackingItems } from "../packingEngine";
import {
    environmentOptions,
    tripStyleOptions,
    ClimateOption,
    EnvironmentOption,
    TripStyleOption,
} from "../tripProfiles";

export function usePackingList(tripId: number) {
    const [items, setItems] = useState<PackingItem[]>([]);
    const [deletedItem, setDeletedItem] = useState<PackingItem | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [tripTitle, setTripTitle] = useState("Trip");
    const [tripDestination, setTripDestination] = useState("");
    const [tripDays, setTripDays] = useState(1);
    const [tripImageUrl, setTripImageUrl] = useState<string | null>(null);
    const [weatherSummary, setWeatherSummary] =
        useState<TripWeatherSummary | null>(null);
    const [packingListId, setPackingListId] = useState<string | null>(null);
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
                    ? {
                        ...item,
                        packed: !item.packed,
                    }
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
                        quantity: item.quantity - 1,
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
                item.key === itemKey
                    ? {
                        ...item,
                        hidden: true,
                    }
                    : item
            )
        );

        if (!options.showUndo) {
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

        setItems((currentItems) =>
            currentItems.map((item) =>
                item.key === deletedItem.key
                    ? {
                        ...item,
                        hidden: false,
                    }
                    : item
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

            await loadTripOverview(tripId);

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            let { data: profile } = await supabase
                .from("packing_profiles")
                .select("*")
                .eq("trip_id", tripId)
                .eq("owner_user_id", user.id)
                .eq("type", "personal")
                .maybeSingle();

            if (!profile) {
                const { data: createdProfile, error: profileError } = await supabase
                    .from("packing_profiles")
                    .upsert(
                        {
                            trip_id: tripId,
                            name: "My Packing List",
                            type: "personal",
                            is_shared: false,
                            owner_user_id: user.id,
                            created_by: user.id,
                        },
                        {
                            onConflict: "trip_id,owner_user_id,type",
                        }
                    )
                    .select()
                    .single();

                if (profileError) {
                    console.error(profileError);
                    return;
                }

                profile = createdProfile;
            }

            setPackingProfileId(profile.id);
            setPackingProfileName(profile.name);
            setPackingProfileType(profile.type);

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
                    environmentOptions.includes(profile as EnvironmentOption)
                )
            );

            setSelectedTripStyles(
                savedProfiles.filter((profile: string) =>
                    tripStyleOptions.includes(profile as TripStyleOption)
                )
            );

            const { data: savedItems } = await supabase
                .from("packing_items")
                .select("*")
                .eq("packing_profile_id", profile.id)
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
            }

            setLoaded(true);
        }

        loadPackList();
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

    return {
        items,
        setItems,

        packingListId,
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