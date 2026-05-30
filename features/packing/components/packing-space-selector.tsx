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
            {open && availableOptions.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-end bg-black/30 px-4 pb-8">
                    <div className="w-full rounded-[2rem] bg-white p-5 shadow-2xl min-h-[28rem]">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-neutral-400">
                                    New packing space
                                </p>

                                <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-neutral-950">
                                    What are you packing?
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

                        <div className="grid gap-2">
                            {availableOptions.map((option) => (
                                <button
                                    key={option.title}
                                    type="button"
                                    onClick={() => handleCreate(option)}
                                    disabled={creatingTitle !== null}
                                    className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-4 text-left transition hover:bg-neutral-100 active:scale-[0.98] disabled:opacity-50"
                                >
                                    <span>
                                        <span className="block text-base font-bold text-neutral-950">
                                            {creatingTitle === option.title
                                                ? "Creating…"
                                                : option.title}
                                        </span>

                                        <span className="mt-0.5 block text-xs font-medium capitalize text-neutral-400">
                                            {option.type}
                                        </span>
                                    </span>

                                    <span className="text-xl text-neutral-300">+</span>
                                </button>
                            ))}
                        </div>
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