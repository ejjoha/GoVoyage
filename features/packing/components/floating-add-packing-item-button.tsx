"use client";

import { useMemo, useState } from "react";
import { createPackingItem } from "../lib/packing-mutations";
import type { PackingListItem } from "../types/packing.types";

type Props = {
    packingListId: string;
    existingItems: PackingListItem[];
    onCreated: (item: PackingListItem) => void;
};

const defaultCategories = [
    "Essentials",
    "Clothing",
    "Tech",
    "Toiletries",
    "Documents",
    "Health",
    "Other",
];

export default function FloatingAddPackingItemButton({
    packingListId,
    existingItems,
    onCreated,
}: Props) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [category, setCategory] = useState("Other");
    const [saving, setSaving] = useState(false);

    const categories = useMemo(() => {
        const fromItems = existingItems
            .map((item) => item.category)
            .filter(Boolean) as string[];

        return Array.from(
            new Set([...defaultCategories, ...fromItems])
        );
    }, [existingItems]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedName = name.trim();
        if (!trimmedName || saving) return;

        setSaving(true);

        try {
            const item = await createPackingItem({
                packingListId,
                name: trimmedName,
                category,
            });

            onCreated(item);
            setName("");
            setCategory("Other");
            setOpen(false);
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-3xl font-light text-white shadow-[0_12px_30px_rgba(0,0,0,0.22)] transition active:scale-95"
                aria-label="Add packing item"
            >
                +
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-end bg-black/30 px-4 pb-4">
                    <div className="w-full rounded-[2rem] bg-white p-5 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-neutral-400">
                                    Add item
                                </p>

                                <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-neutral-950">
                                    What do you need?
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

                        <form onSubmit={handleSubmit}>
                            <input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Item name"
                                autoFocus
                                className="w-full rounded-2xl bg-neutral-100 px-4 py-4 text-base font-semibold text-neutral-950 outline-none placeholder:text-neutral-400"
                            />

                            <div className="mt-5">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
                                    Category
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {categories.map((option) => {
                                        const selected = option === category;

                                        return (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => setCategory(option)}
                                                className={
                                                    selected
                                                        ? "rounded-full bg-neutral-950 px-4 py-2 text-sm font-bold text-white"
                                                        : "rounded-full bg-neutral-100 px-4 py-2 text-sm font-bold text-neutral-500"
                                                }
                                            >
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!name.trim() || saving}
                                className="mt-6 w-full rounded-2xl bg-rose-500 px-5 py-4 text-base font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
                            >
                                {saving ? "Adding…" : "Add item"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}