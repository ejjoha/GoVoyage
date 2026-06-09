"use client";

import { useEffect, useState } from "react";
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
        { name: "Sanitary products", category: "Toiletries", quantity: 1, source: "suggested", packed: false, hidden: false, protected: true },
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
        { name: "Laundry bag", category: "Comfort & Travel", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
};
const weatherItems: Record<string, Array<{
    name: string;
    category: string;
    quantity: number;
    source: "suggested";
    packed: false;
    hidden: false;
    protected: boolean;
}>> = {
    Hot: [
        { name: "High SPF sunscreen", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Cap or sun hat", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Linen or light shirts", category: "Clothing", quantity: 3, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "After-sun lotion", category: "Toiletries", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    Cold: [
        { name: "Warm coat", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: true },
        { name: "Thermal base layers", category: "Weather", quantity: 2, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Gloves", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Beanie", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Scarf or neck warmer", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Warm socks", category: "Footwear", quantity: 2, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    Rainy: [
        { name: "Umbrella", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Waterproof jacket", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Waterproof shoes", category: "Footwear", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Dry bag", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
};
const tripTypeItems: Record<string, Array<{
    name: string;
    category: string;
    quantity: number;
    source: "suggested";
    packed: false;
    hidden: false;
    protected: boolean;
}>> = {
    Business: [
        { name: "Business outfit", category: "City & Business", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Laptop", category: "Tech", quantity: 1, source: "suggested", packed: false, hidden: false, protected: true },
        { name: "Laptop charger", category: "Tech", quantity: 1, source: "suggested", packed: false, hidden: false, protected: true },
        { name: "Notebook and pen", category: "City & Business", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    "Traveling with kids": [
        { name: "Kids’ documents", category: "Kids & Family", quantity: 1, source: "suggested", packed: false, hidden: false, protected: true },
        { name: "Passports/IDs", category: "Kids & Family", quantity: 1, source: "suggested", packed: false, hidden: false, protected: true },
        { name: "Snacks", category: "Kids & Family", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Refillable water bottles", category: "Kids & Family", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Toys/books", category: "Kids & Family", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Tablet + headphones", category: "Kids & Family", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Wipes", category: "Kids & Family", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Medication", category: "Kids & Family", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Spare clothes", category: "Kids & Family", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Favorite stuffed animal", category: "Kids & Family", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
};

function normalizeName(name: string) {
    return name.trim().toLowerCase();
}

export default function AddPackingCategoriesModal({
    open,
    packingListId,
    existingItems,
    defaultWeather,
    onClose,
    onCreated,
    onItemsHidden,
}: Props) {

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [initialCategories, setInitialCategories] = useState<string[]>([]);
    const [selectedWeather, setSelectedWeather] = useState<string[]>(defaultWeather);
    const [selectedTripTypes, setSelectedTripTypes] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        if (!open) return;

        setSelectedWeather(defaultWeather);
    }, [open, defaultWeather]);

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

            const removedCategories = initialCategories.filter(
                (category) =>
                    category !== "Essentials" &&
                    !selectedCategories.includes(category)
            );

            const itemIdsToHide = existingItems
                .filter((item) => removedCategories.includes(item.category))
                .map((item) => item.id);

            const categoryGeneratedItems = selectedCategories.flatMap(
                (category) => categoryItems[category] ?? []
            );

            const itemsToCreate = [
                ...categoryGeneratedItems,
            ].filter((item) => !existingNames.has(normalizeName(item.name)));

            if (itemIdsToHide.length > 0) {
                await Promise.all(itemIdsToHide.map((itemId) => hidePackingItem(itemId)));
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
