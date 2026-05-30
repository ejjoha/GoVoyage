"use client";

import { useMemo, useState } from "react";
import { createPackingList } from "../lib/packing-mutations";
import type { PackingList, PackingListItem } from "../types/packing.types";

type Props = {
    tripId: number;
    lists: PackingList[];
    itemsByList: Record<string, PackingListItem[]>;
    activeListId: string | null;
    onSelectList: (listId: string) => void;
    onCreated: (list: PackingList) => void;
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

    async function handleCreate(option: (typeof options)[number]) {
        if (creatingTitle) return;

        setCreatingTitle(option.title);

        try {
            const list = await createPackingList({
                tripId,
                title: option.title,
                type: option.type,
                emoji: option.emoji,
            });

            onCreated(list);
            onSelectList(list.id);
            setOpen(false);
        } finally {
            setCreatingTitle(null);
        }
    }

    return (
        <section className="mb-5">
            <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-400">
                    Packing spaces
                </p>

                {availableOptions.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setOpen((current) => !current)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-semibold text-neutral-700 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition active:scale-95"
                        aria-label="Create packing space"
                    >
                        +
                    </button>
                )}
            </div>

            {open && availableOptions.length > 0 && (
                <div className="mb-4 rounded-[1.5rem] bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                    <div className="grid gap-2 sm:grid-cols-2">
                        {availableOptions.map((option) => (
                            <button
                                key={option.title}
                                type="button"
                                onClick={() => handleCreate(option)}
                                disabled={creatingTitle !== null}
                                className="flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3 text-left transition hover:bg-neutral-100 active:scale-[0.98] disabled:opacity-50"
                            >
                                <span className="text-xl">{option.emoji}</span>

                                <span>
                                    <span className="block text-sm font-bold text-neutral-950">
                                        {creatingTitle === option.title
                                            ? "Creating…"
                                            : option.title}
                                    </span>

                                    <span className="mt-0.5 block text-xs font-medium capitalize text-neutral-400">
                                        {option.type}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
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
                                    ? "min-w-[9.5rem] scale-[1.02] rounded-[1.5rem] bg-white px-4 py-4 text-left text-neutral-950 shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition active:scale-[0.99]"
                                    : "min-w-[9rem] rounded-[1.5rem] bg-white/65 px-4 py-4 text-left text-neutral-950 opacity-85 shadow-[0_2px_10px_rgba(0,0,0,0.025)] transition active:scale-95"
                            }
                        >
                            <p className="text-2xl">{list.emoji ?? "🧳"}</p>

                            <p className="mt-2 truncate text-base font-bold">
                                {list.title}
                            </p>

                            <p className="mt-1 text-xs font-bold text-neutral-400">
                                {packedCount} of {items.length}
                            </p>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}