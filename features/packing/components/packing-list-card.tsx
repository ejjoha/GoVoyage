"use client";

import { useState } from "react";
import type { PackingList, PackingListItem } from "../types/packing.types";
import SmartSuggestionsPrompt from "./smart-suggestions-prompt";
import PackingCategorySection from "./packing-category-section";

type Props = {
    list: PackingList;
    items: PackingListItem[];
    tripDays: number;
    defaultClimates: string[];
    onToggleItem: (item: PackingListItem) => void;
    onCreateItem: (listId: string, item: PackingListItem) => void;
    onArchiveList: (listId: string) => void;
    onDecreaseQuantity: (item: PackingListItem) => void;
    onIncreaseQuantity: (item: PackingListItem) => void;
};

export default function PackingListCard({
    list,
    items,
    tripDays,
    defaultClimates,
    onToggleItem,
    onCreateItem,
    onArchiveList,
    onDecreaseQuantity,
    onIncreaseQuantity,
}: Props) {
    const [open, setOpen] = useState(true);

    const packedCount = items.filter((item) => item.packed).length;
    const totalCount = items.length;
    const progress = totalCount === 0 ? 0 : Math.round((packedCount / totalCount) * 100);

    const groupedItems = items.reduce<Record<string, PackingListItem[]>>(
        (groups, item) => {
            const category = item.category || "Other";
            return {
                ...groups,
                [category]: [...(groups[category] ?? []), item],
            };
        },
        {}
    );

    return (
        <section className="pb-24">
            <div className="mt-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
                        Categories
                    </h2>

                    <button
                        type="button"
                        onClick={() => setOpen((current) => !current)}
                        className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-500 transition active:scale-95"
                    >
                        {open ? "Hide" : "Show"}
                    </button>
                </div>

                {open && (
                    <div className="mt-5">
                        {items.length === 0 ? (
                            <SmartSuggestionsPrompt
                                list={list}
                                tripDays={tripDays}
                                defaultClimates={defaultClimates}
                                onCreated={(createdItems) => {
                                    createdItems.forEach((item) => onCreateItem(list.id, item));
                                }}
                            />
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(groupedItems).map(([category, categoryItems]) => (
                                    <PackingCategorySection
                                        key={category}
                                        category={category}
                                        items={categoryItems}
                                        onToggleItem={onToggleItem}
                                        onDecreaseQuantity={onDecreaseQuantity}
                                        onIncreaseQuantity={onIncreaseQuantity}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={() => onArchiveList(list.id)}
                                className="text-sm font-bold text-neutral-300 transition hover:text-rose-500 active:scale-95"
                            >
                                Remove list
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}