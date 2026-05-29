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

const climateOptions = ["Hot", "Cold", "Rainy"];
const environmentOptions = ["City", "Beach", "Mountain"];
const tripStyleOptions = ["Business", "Traveling with kids"];

export default function SmartSuggestionsPrompt({
    list,
    tripDays,
    onCreated,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    const [selectedClimates, setSelectedClimates] = useState<string[]>([]);
    const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);
    const [selectedTripStyles, setSelectedTripStyles] = useState<string[]>([]);

    if (dismissed) return null;

    function toggleValue(value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) {
        setter((current) =>
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value]
        );
    }

    async function handleAddSuggestions() {
        if (loading) return;

        setLoading(true);

        try {
            const suggestions = getSuggestedItemsForList({
                list,
                tripDays,
                selectedClimates,
                selectedEnvironments,
                selectedTripStyles,
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
                Choose what fits this trip. We’ll add a starter list you can edit.
            </p>

            <SuggestionGroup
                title="Climate"
                options={climateOptions}
                selected={selectedClimates}
                onToggle={(value) => toggleValue(value, setSelectedClimates)}
            />

            <SuggestionGroup
                title="Environment"
                options={environmentOptions}
                selected={selectedEnvironments}
                onToggle={(value) => toggleValue(value, setSelectedEnvironments)}
            />

            <SuggestionGroup
                title="Trip style"
                options={tripStyleOptions}
                selected={selectedTripStyles}
                onToggle={(value) => toggleValue(value, setSelectedTripStyles)}
            />

            <div className="mt-5 flex gap-2">
                <button
                    type="button"
                    onClick={handleAddSuggestions}
                    disabled={loading}
                    className="rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-bold text-white transition active:scale-95 disabled:opacity-50"
                >
                    {loading ? "Adding…" : "Generate suggestions"}
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

function SuggestionGroup({
    title,
    options,
    selected,
    onToggle,
}: {
    title: string;
    options: string[];
    selected: string[];
    onToggle: (value: string) => void;
}) {
    return (
        <div className="mt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">
                {title}
            </p>

            <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                    const active = selected.includes(option);

                    return (
                        <button
                            key={option}
                            type="button"
                            onClick={() => onToggle(option)}
                            className={
                                active
                                    ? "rounded-full bg-rose-500 px-3 py-1.5 text-sm font-bold text-white"
                                    : "rounded-full bg-white px-3 py-1.5 text-sm font-bold text-neutral-500 shadow-sm"
                            }
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}