"use client";

import { useState } from "react";
import { createSuggestedPackingItems } from "../lib/packing-mutations";
import type { PackingListItem } from "../types/packing.types";

type Props = {
    open: boolean;
    packingListId: string;
    existingItems: PackingListItem[];
    onClose: () => void;
    onCreated: (items: PackingListItem[]) => void;
};

const categoryOptions = [
    "Clothing",
    "Toiletries",
    "Tech",
    "Health & Safety",
    "Footwear",
    "Comfort & Travel",
];

const weatherOptions = ["Hot", "Cold", "Rainy"];

const tripTypeOptions = ["Business", "Traveling with kids"];

const categoryItems: Record<string, Array<{
    name: string;
    category: string;
    quantity: number;
    source: "suggested";
    packed: false;
    hidden: false;
    protected: boolean;
}>> = {
    Clothing: [
        { name: "Underwear", category: "Clothing", quantity: 3, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Socks", category: "Clothing", quantity: 3, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "T-shirts or tops", category: "Clothing", quantity: 3, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Pants or skirts", category: "Clothing", quantity: 2, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Sleepwear", category: "Clothing", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Light jacket or layer", category: "Clothing", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    Toiletries: [
        { name: "Toothbrush", category: "Toiletries", quantity: 1, source: "suggested", packed: false, hidden: false, protected: true },
        { name: "Toothpaste", category: "Toiletries", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Deodorant", category: "Toiletries", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Shampoo or hair care", category: "Toiletries", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Skin care", category: "Toiletries", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Razor or grooming kit", category: "Toiletries", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    Tech: [
        { name: "Power bank", category: "Tech", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Travel adapter", category: "Tech", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    "Health & Safety": [
        { name: "Pain reliever", category: "Health & Safety", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Basic first aid", category: "Health & Safety", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    Footwear: [
        { name: "Comfortable shoes", category: "Footwear", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    "Comfort & Travel": [
        { name: "Reusable water bottle", category: "Comfort & Travel", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Sunglasses", category: "Comfort & Travel", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Travel snacks", category: "Comfort & Travel", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Laundry bag", category: "Laundry", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
};

function normalizeName(name: string) {
    return name.trim().toLowerCase();
}

export default function AddPackingCategoriesModal({
    open,
    packingListId,
    existingItems,
    onClose,
    onCreated,
}: Props) {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([
        "Clothing",
        "Toiletries",
    ]);
    const [selectedWeather, setSelectedWeather] = useState<string[]>(["Rainy"]);
    const [selectedTripTypes, setSelectedTripTypes] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    if (!open) return null;

    function toggleCategory(category: string) {
        setSelectedCategories((current) =>
            current.includes(category)
                ? current.filter((item) => item !== category)
                : [...current, category]
        );
    }

    function toggleWeather(weather: string) {
        setSelectedWeather((current) =>
            current.includes(weather)
                ? current.filter((item) => item !== weather)
                : [...current, weather]
        );
    }

    function toggleTripType(type: string) {
        setSelectedTripTypes((current) =>
            current.includes(type)
                ? current.filter((item) => item !== type)
                : [...current, type]
        );
    }

    async function handleAddSelectedCategories() {
        if (saving || selectedCategories.length === 0) return;

        setSaving(true);

        try {
            const existingNames = new Set(
                existingItems.map((item) => normalizeName(item.name))
            );

            const itemsToCreate = selectedCategories
                .flatMap((category) => categoryItems[category] ?? [])
                .filter((item) => !existingNames.has(normalizeName(item.name)));

            if (itemsToCreate.length === 0) {
                onClose();
                return;
            }

            const createdItems = await createSuggestedPackingItems({
                packingListId,
                items: itemsToCreate,
            });

            onCreated(createdItems);
            onClose();
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 px-4 pb-4">
            <div className="w-full rounded-[2rem] bg-white p-5 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-neutral-400">
                            Add categories
                        </p>

                        <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-neutral-950">
                            Build your packing list
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-xl font-bold text-neutral-500"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <p className="text-sm leading-6 text-neutral-500">
                    Choose the areas you want to add to your packing list.
                </p>

                <div className="mt-5">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">
                        Categories
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {categoryOptions.map((category) => {
                            const active = selectedCategories.includes(category);

                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => toggleCategory(category)}
                                    className={
                                        active
                                            ? "rounded-full bg-rose-500 px-3 py-1.5 text-sm font-bold text-white"
                                            : "rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-bold text-neutral-500"
                                    }
                                >
                                    {active ? "✓ " : ""}
                                    {category}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-6">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">
                        Weather
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {weatherOptions.map((weather) => {
                            const active = selectedWeather.includes(weather);

                            return (
                                <button
                                    key={weather}
                                    type="button"
                                    onClick={() => toggleWeather(weather)}
                                    className={
                                        active
                                            ? "rounded-full bg-sky-500 px-3 py-1.5 text-sm font-bold text-white"
                                            : "rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-bold text-neutral-500"
                                    }
                                >
                                    {active ? "✓ " : ""}
                                    {weather}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-6">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">
                        Trip Type
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {tripTypeOptions.map((type) => {
                            const active = selectedTripTypes.includes(type);

                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => toggleTripType(type)}
                                    className={
                                        active
                                            ? "rounded-full bg-emerald-500 px-3 py-1.5 text-sm font-bold text-white"
                                            : "rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-bold text-neutral-500"
                                    }
                                >
                                    {active ? "✓ " : ""}
                                    {type}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleAddSelectedCategories}
                    disabled={selectedCategories.length === 0 || saving}
                    className="mt-6 w-full rounded-2xl bg-neutral-950 px-5 py-4 text-base font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
                >
                    {saving ? "Adding…" : "Add selected categories"}
                </button>
            </div>
        </div>
    );
}