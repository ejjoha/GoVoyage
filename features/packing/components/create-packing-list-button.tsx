"use client";

import { useState } from "react";
import { createPackingList } from "../lib/packing-mutations";
import type { PackingList } from "../types/packing.types";

type Props = {
    tripId: number;
    onCreated: (list: PackingList) => void;
};

const suggestions = [
    {
        title: "My list",
        type: "personal" as const,
        emoji: "🧳",
    },
    {
        title: "Shared toiletries",
        type: "shared" as const,
        emoji: "🧴",
    },
    {
        title: "Carry-on",
        type: "luggage" as const,
        emoji: "🎒",
    },
];

export default function CreatePackingListButton({
    tripId,
    onCreated,
}: Props) {
    const [creatingTitle, setCreatingTitle] = useState<string | null>(null);

    async function handleCreate(
        suggestion: (typeof suggestions)[number]
    ) {
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
        } finally {
            setCreatingTitle(null);
        }
    }

    return (
        <div className="mt-6">
            <p className="text-sm font-semibold text-neutral-500">
                Start with
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                    <button
                        key={suggestion.title}
                        type="button"
                        onClick={() => handleCreate(suggestion)}
                        disabled={creatingTitle !== null}
                        className="rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-50"
                    >
                        {creatingTitle === suggestion.title
                            ? "Creating…"
                            : `${suggestion.emoji} ${suggestion.title}`}
                    </button>
                ))}
            </div>
        </div>
    );
}