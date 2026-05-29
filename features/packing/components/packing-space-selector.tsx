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
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-neutral-400">
                Packing spaces
            </p>

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
                                    ? "min-w-[9rem] rounded-[1.5rem] bg-neutral-950 px-4 py-4 text-left text-white shadow-sm transition active:scale-95"
                                    : "min-w-[9rem] rounded-[1.5rem] bg-white px-4 py-4 text-left text-neutral-950 shadow-sm transition active:scale-95"
                            }
                        >
                            <p className="text-2xl">{list.emoji ?? "🧳"}</p>

                            <p className="mt-2 truncate text-base font-bold">
                                {list.title}
                            </p>

                            <p
                                className={
                                    isActive
                                        ? "mt-1 text-xs font-bold text-white/50"
                                        : "mt-1 text-xs font-bold text-neutral-400"
                                }
                            >
                                {packedCount} of {items.length}
                            </p>
                        </button>
                    );
                })}

                {availableOptions.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setOpen((current) => !current)}
                        className="flex min-w-[9rem] flex-col justify-center rounded-[1.5rem] border border-dashed border-neutral-300 bg-white/60 px-4 py-4 text-left shadow-sm transition active:scale-95"
                    >
                        <p className="text-3xl font-light text-neutral-400">+</p>

                        <p className="mt-2 text-base font-bold text-neutral-700">
                            New space
                        </p>

                        <p className="mt-1 text-xs font-bold text-neutral-400">
                            Add list
                        </p>
                    </button>
                )}
            </div>

            {open && availableOptions.length > 0 && (
                <div className="mt-3 rounded-[1.5rem] bg-white p-3 shadow-sm">
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
        </section>
    );
}