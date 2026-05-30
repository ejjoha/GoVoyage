"use client";

import { useState } from "react";
import { createPackingList } from "../lib/packing-mutations";
import type { PackingList } from "../types/packing.types";

type Props = {
    tripId: number;
    onCreated: (list: PackingList) => void;
};

const suggestions = [
    { title: "My List", type: "personal" as const, emoji: "🧳" },
    { title: "Carry-on", type: "luggage" as const, emoji: "🎒" },
    { title: "Shared Bag", type: "shared" as const, emoji: "👜" },
];

export default function CreatePackingListButton({
    tripId,
    onCreated,
}: Props) {
    const [open, setOpen] = useState(false);
    const [creatingTitle, setCreatingTitle] = useState<string | null>(null);

    async function handleCreate(suggestion: (typeof suggestions)[number]) {
        if (creatingTitle) return;

        setCreatingTitle(suggestion.title);

        try {
            const list = await createPackingList({
                tripId,
                title: suggestion.title,
                type: suggestion.type,
                emoji: suggestion.emoji,
            });

            onCreated({
                ...list,
                emoji: suggestion.emoji,
            });

            setOpen(false);
        } finally {
            setCreatingTitle(null);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-6 rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition active:scale-95"
            >
                Create packing space
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-end bg-black/30 px-4 pb-4">
                    <div className="min-h-[26rem] w-full rounded-[2rem] bg-white p-5 shadow-2xl">
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
                            {suggestions.map((suggestion) => (
                                <button
                                    key={suggestion.title}
                                    type="button"
                                    onClick={() => handleCreate(suggestion)}
                                    disabled={creatingTitle !== null}
                                    className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-4 text-left transition hover:bg-neutral-100 active:scale-[0.98] disabled:opacity-50"
                                >
                                    <span>
                                        <span className="block text-base font-bold text-neutral-950">
                                            {creatingTitle === suggestion.title
                                                ? "Creating…"
                                                : suggestion.title}
                                        </span>

                                        <span className="mt-0.5 block text-xs font-medium capitalize text-neutral-400">
                                            {suggestion.type}
                                        </span>
                                    </span>

                                    <span className="text-xl text-neutral-300">
                                        +
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}