"use client";

import { useEffect, useMemo, useState } from "react";
import type { PackingItem } from "../packingSuggestions";
import { supabase } from "@/lib/supabase";
import {
    getTripWeatherSummary,
    TripWeatherSummary,
} from "../weatherIntelligence";

export function usePackingList() {
    const [items, setItems] = useState<PackingItem[]>([]);
    const [deletedItem, setDeletedItem] = useState<PackingItem | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [tripTitle, setTripTitle] = useState("Trip");
    const [tripDestination, setTripDestination] = useState("");
    const [tripDays, setTripDays] = useState(1);
    const [tripImageUrl, setTripImageUrl] = useState<string | null>(null);
    const [weatherSummary, setWeatherSummary] =
        useState<TripWeatherSummary | null>(null);
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

    return {
        items,
        setItems,
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
        loadTripOverview,
    };
}