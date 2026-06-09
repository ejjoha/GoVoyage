"use client";

import { useEffect, useState } from "react";
import {
    baseItems,
    getSmartQuantity,
} from "../lib/packing-template-engine";
import {
    createSuggestedPackingItems,
    hidePackingItem,
} from "../lib/packing-mutations";
import type { PackingListItem } from "../types/packing.types";

type Props = {
    open: boolean;
    packingListId: string;
    existingItems: PackingListItem[];
    defaultWeather: string[];
    tripDays: number;
    onClose: () => void;
    onCreated: (items: PackingListItem[]) => void;
    onItemsHidden: (itemIds: string[]) => void;
};

const categoryOptions = [
    "Essentials",
    "Clothing",
    "Toiletries",
    "Tech",
    "Health & Safety",
    "Footwear",
    "Comfort & Travel",
];

function normalizeName(name: string) {
    return name.trim().toLowerCase();
}

export default function AddPackingCategoriesModal({
    open,
    packingListId,
    existingItems,
    defaultWeather,
    tripDays,
    onClose,
    onCreated,
    onItemsHidden,
}: Props) {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [initialCategories, setInitialCategories] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;

        const existingCategories = Array.from(
            new Set(
                existingItems
                    .map((item) => item.category)
                    .filter((category) => categoryOptions.includes(category))
            )
        );

        setSelectedCategories(existingCategories);
        setInitialCategories(existingCategories);
    }, [open, existingItems]);

    if (!open) return null;

    function toggleCategory(category: string) {
        if (category === "Essentials") return;

        setSelectedCategories((current) =>
            current.includes(category)
                ? current.filter((item) => item !== category)
                : [...current, category]
        );
    }

    async function handleAddSelectedCategories() {
        if (saving || selectedCategories.length === 0) return;

        setSaving(true);

        try {
            const existingNames = new Set(
                existingItems.map((item) => normalizeName(item.name))
            );

            const removedCategories = initialCategories.filter(
                (category) =>
                    category !== "Essentials" &&
                    !selectedCategories.includes(category)
            );

            const itemIdsToHide = existingItems
                .filter((item) => removedCategories.includes(item.category))
                .map((item) => item.id);

            const categoryGeneratedItems = baseItems
                .filter((item) => selectedCategories.includes(item.category))
                .filter((item) => item.category !== "Essentials")
                .map((item) => ({
                    name: item.name,
                    category:
                        item.name === "Laundry bag"
                            ? "Comfort & Travel"
                            : item.category,
                    quantity: getSmartQuantity(item, tripDays),
                    source: "suggested" as const,
                    packed: false,
                    hidden: false,
                    protected: Boolean(item.protected),
                }));

            const itemsToCreate = categoryGeneratedItems.filter(
                (item) => !existingNames.has(normalizeName(item.name))
            );

            if (itemIdsToHide.length > 0) {
                await Promise.all(
                    itemIdsToHide.map((itemId) => hidePackingItem(itemId))
                );
                onItemsHidden(itemIdsToHide);
            }

            if (itemsToCreate.length > 0) {
                const createdItems = await createSuggestedPackingItems({
                    packingListId,
                    items: itemsToCreate,
                });

                onCreated(createdItems);
            }

            onClose();
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 px-4 pb-4">
            <div className="w-full rounded-[2rem] bg-white p-5 shadow-2xl">
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h2 className="mt-2 text-2xl font-bold tracking-[-0.05em] text-neutral-950">
                            Build your packing list
                        </h2>
                        <p className="text-sm font-bold text-neutral-400">
                            Add categories
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-3xl font-bold text-neutral-500"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="mt-16">
                    <div className="flex flex-wrap gap-5">
                        {categoryOptions.map((category) => {
                            const active = selectedCategories.includes(category);
                            const locked = category === "Essentials";

                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => toggleCategory(category)}
                                    className={
                                        active
                                            ? "rounded-full bg-neutral-950 px-5 py-2 text-sm font-bold text-white transition active:scale-95"
                                            : "rounded-full bg-neutral-100 px-5 py-2 text-sm font-bold text-neutral-500 transition active:scale-95"
                                    }
                                >
                                    {category}
                                    {locked ? " ✓" : ""}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleAddSelectedCategories}
                    disabled={selectedCategories.length === 0 || saving}
                    className="mt-20 w-full rounded-2xl bg-rose-500 px-5 py-4 text-base font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
                >
                    {saving ? "Updating…" : "Update packing list"}
                </button>
            </div>
        </div>
    );
}