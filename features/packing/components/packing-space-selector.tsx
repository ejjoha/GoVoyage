"use client";

import { useMemo, useState } from "react";
import {
    createPackingList,
    createSuggestedPackingItems,
} from "../lib/packing-mutations";
import { getSuggestedItemsForList } from "../lib/packing-suggestions";
import type { PackingList, PackingListItem } from "../types/packing.types";

type Props = {
    tripId: number;
    lists: PackingList[];
    itemsByList: Record<string, PackingListItem[]>;
    activeListId: string | null;
    onSelectList: (listId: string) => void;
    tripDays: number;
    defaultClimates: string[];
    onCreated: (list: PackingList, items?: PackingListItem[]) => void;
};

const options = [
    { title: "My List", type: "personal" as const, emoji: "🧳" },
    { title: "Carry-on", type: "luggage" as const, emoji: "🎒" },
    { title: "Shared Bag", type: "shared" as const, emoji: "👜" },
    { title: "Kids List", type: "personal" as const, emoji: "🧸" },
];

export default function PackingSpaceSelector({
    tripId,
    lists,
    itemsByList,
    activeListId,
    onSelectList,
    onCreated,
    tripDays,
    defaultClimates,
}: Props) {
    const [open, setOpen] = useState(false);
    const [creatingTitle, setCreatingTitle] = useState<string | null>(null);

    const availableOptions = useMemo(() => {
        const existingTitles = new Set(
            lists.map((list) => list.title.toLowerCase())
        );

        return options.filter(
            (option) => !existingTitles.has(option.title.toLowerCase())
        );
    }, [lists]);

    const [selectedOption, setSelectedOption] = useState<(typeof options)[number] | null>(null);
    const [customTitle, setCustomTitle] = useState("");
    const [selectedClimates, setSelectedClimates] = useState<string[]>(defaultClimates);
    const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);
    const [selectedTripStyles, setSelectedTripStyles] = useState<string[]>([]);
    const climateOptions = ["Hot", "Cold", "Rainy"];
    const environmentOptions = ["City", "Beach", "Mountain"];
    const tripStyleOptions = ["Business", "Traveling with kids"];

    async function handleCreate() {
        if (!selectedOption || creatingTitle) return;

        setCreatingTitle(selectedOption.title);

        try {
            const list = await createPackingList({
                tripId,
                title: selectedOption.title,
                type: selectedOption.type,
                emoji: selectedOption.emoji,
            });

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

            onCreated(list, createdItems);
            onSelectList(list.id);

            setOpen(false);
            setSelectedOption(null);
            setSelectedClimates(defaultClimates);
            setSelectedEnvironments([]);
            setSelectedTripStyles([]);
        } finally {
            setCreatingTitle(null);
        }
    }

    return (
        <section className="mb-5">
            {open && availableOptions.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-end bg-black/30 px-4 pb-8">
                    <div className="w-full rounded-[2rem] bg-white p-5 shadow-2xl min-h-[28rem]">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-neutral-400">
                                    New packing space
                                </p>

                                <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-neutral-950">
                                    {selectedOption ? "Customize space" : "What are you packing?"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-xl font-bold text-neutral-500"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        {!selectedOption ? (
                            <div className="grid gap-2">
                                {availableOptions.map((option) => (
                                    <button
                                        key={option.title}
                                        type="button"
                                        onClick={() => {
                                            setSelectedOption(option);
                                            setCustomTitle(option.title);
                                        }}
                                        className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-4 text-left transition hover:bg-neutral-100 active:scale-[0.98]"
                                    >
                                        <span>
                                            <span className="block text-base font-bold text-neutral-950">
                                                {option.title}
                                            </span>

                                            <span className="mt-0.5 block text-xs font-medium capitalize text-neutral-400">
                                                {option.type}
                                            </span>
                                        </span>

                                        <span className="text-xl text-neutral-300">›</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div>
                                <div className="mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedOption(null)}
                                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition active:scale-95"
                                        aria-label="Back"
                                    >
                                        <img
                                            src="/icons/arrow-left.svg"
                                            alt=""
                                            className="h-5 w-5 opacity-80"
                                        />
                                    </button>
                                    </div>
                                        <p className="text-sm font-bold text-neutral-400">
                                            {selectedOption.title}
                                        </p>

                                        <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-neutral-950">
                                            Tailor your suggestions
                                        </h2>

                                        <SuggestionGroup
                                            title="Climate"
                                            options={climateOptions}
                                            selected={selectedClimates}
                                            onToggle={(value) =>
                                                setSelectedClimates((current) =>
                                                    current.includes(value)
                                                        ? current.filter((item) => item !== value)
                                                        : [...current, value]
                                                )
                                            }
                                        />

                                        <SuggestionGroup
                                            title="Environment"
                                            options={environmentOptions}
                                            selected={selectedEnvironments}
                                            onToggle={(value) =>
                                                setSelectedEnvironments((current) =>
                                                    current.includes(value)
                                                        ? current.filter((item) => item !== value)
                                                        : [...current, value]
                                                )
                                            }
                                        />

                                        <SuggestionGroup
                                            title="Trip style"
                                            options={tripStyleOptions}
                                            selected={selectedTripStyles}
                                            onToggle={(value) =>
                                                setSelectedTripStyles((current) =>
                                                    current.includes(value)
                                                        ? current.filter((item) => item !== value)
                                                        : [...current, value]
                                                )
                                            }
                                        />

                                        <button
                                            type="button"
                                            onClick={handleCreate}
                                            disabled={creatingTitle !== null}
                                            className="mt-6 w-full rounded-2xl bg-neutral-950 px-5 py-4 text-base font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
                                        >
                                            {creatingTitle ? "Generating…" : "Generate suggestions"}
                                        </button>
                                    </div>
                        )}
                                </div>
                            </div>
                        )}

                        <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 scrollbar-hide">
                            {lists.map((list) => {
                                const items = itemsByList[list.id] ?? [];
                                const packedCount = items.filter((item) => item.packed).length;
                                const isActive = list.id === activeListId;

                                return (
                                    <button
                                        key={list.id}
                                        type="button"
                                        onClick={() => onSelectList(list.id)}
                                        className={
                                            isActive
                                                ? "min-w-[8.5rem] rounded-[1.25rem] bg-white px-4 py-3 text-left text-neutral-950 shadow-[0_8px_24px_rgba(0,0,0,0.07)] transition active:scale-[0.98]"
                                                : "min-w-[8.5rem] rounded-[1.25rem] bg-white/60 px-4 py-3 text-left text-neutral-500 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition active:scale-95"
                                        }
                                    >
                                        <p className="truncate text-sm font-semibold">
                                            {list.title}
                                        </p>

                                        <p className="mt-1 text-[11px] font-semibold text-neutral-400">
                                            {packedCount} of {items.length}
                                        </p>
                                    </button>
                                );
                            })}
                            {availableOptions.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setOpen((current) => !current)}
                                    className="flex min-w-[8.5rem] items-center justify-center rounded-[1.25rem] bg-white/60 px-4 py-3 text-left text-neutral-500 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition active:scale-95"
                                    aria-label="Create packing space"
                                >
                                    <div className="text-center">
                                        <p className="text-xl font-light">+</p>

                                        <p className="mt-1 text-[11px] font-semibold text-neutral-400">
                                            New List
                                        </p>
                                    </div>
                                </button>
                            )}
                        </div>
                    </section>
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
                    <div className="mt-5">
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
                                                : "rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-bold text-neutral-500"
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