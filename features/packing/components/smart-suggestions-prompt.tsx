"use client";

import { useState } from "react";
import type {
    PackingList,
    PackingListItem,
} from "../types/packing.types";
import { getSuggestedItemsForList } from "../lib/packing-suggestions";
import { createSuggestedPackingItems } from "../lib/packing-mutations";

type Props = {
    list: PackingList;
    tripDays: number;
    onCreated: (items: PackingListItem[]) => void;
};

export default function SmartSuggestionsPrompt({
    list,
    tripDays,
    onCreated,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    async function handleAddSuggestions() {
        if (loading) return;

        setLoading(true);

        try {
            const suggestions = getSuggestedItemsForList({
                list,
                tripDays,
                selectedClimates: ["Hot"],
                selectedEnvironments: ["Beach"],
                selectedTripStyles: [],
            });

            const createdItems = await createSuggestedPackingItems({
                packingListId: list.id,
                items: suggestions,
            });

            onCreated(createdItems);
            setDismissed(true);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="my-4 rounded-[1.5rem] bg-neutral-50 p-4">
            <p className="text-sm font-bold text-neutral-950">
                Add smart suggestions?
            </p>

            <p className="mt-1 text-sm leading-6 text-neutral-500">
                We can add a simple starter list based on this packing space.
            </p>

            <div className="mt-4 flex gap-2">
                <button
                    type="button"
                    onClick={handleAddSuggestions}
                    disabled={loading}
                    className="rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-bold text-white transition active:scale-95 disabled:opacity-50"
                >
                    {loading ? "Adding…" : "Add essentials"}
                </button>

                <button
                    type="button"
                    onClick={() => setDismissed(true)}
                    className="rounded-full bg-white px-4 py-2.5 text-sm font-bold text-neutral-500 shadow-sm transition active:scale-95"
                >
                    Skip
                </button>
            </div>
        </div>
    );
}