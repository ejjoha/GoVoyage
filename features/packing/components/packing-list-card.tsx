"use client";

import { useState } from "react";
import type { PackingList, PackingListItem } from "../types/packing.types";
import PackingCategorySection from "./packing-category-section";

type Props = {
    list: PackingList;
    items: PackingListItem[];
    onToggleItem: (item: PackingListItem) => void;
    onCreateItem: (listId: string, item: PackingListItem) => void;
    onResetList: (list: PackingList) => void;
    onDeleteList: (list: PackingList) => void;
    onDecreaseQuantity: (item: PackingListItem) => void;
    onIncreaseQuantity: (item: PackingListItem) => void;
    onRemoveItem: (item: PackingListItem) => void;
    resetSwipeKey: number;
};

export default function PackingListCard({
    list,
    items,
    onToggleItem,
    onCreateItem,
    onResetList,
    onDeleteList,
    onDecreaseQuantity,
    onIncreaseQuantity,
    onRemoveItem,
    resetSwipeKey,
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
            <div>
                {open && (
                    <div className="mt-1">
                        <div className="space-y-4">
                            {Object.entries(groupedItems).map(([category, categoryItems]) => (
                                <PackingCategorySection
                                    key={category}
                                    category={category}
                                    items={categoryItems}
                                    onToggleItem={onToggleItem}
                                    onDecreaseQuantity={onDecreaseQuantity}
                                    onIncreaseQuantity={onIncreaseQuantity}
                                    onRemoveItem={onRemoveItem}
                                    resetSwipeKey={resetSwipeKey}
                                />
                            ))}
                        </div>

                        <div className="mt-5 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => onResetList(list)}
                                className="text-sm font-bold text-neutral-300 transition hover:text-rose-500 active:scale-95"
                            >
                                Reset list
                            </button>

                            {list.title === "Kids List" && (
                                <button
                                    type="button"
                                    onClick={() => onDeleteList(list)}
                                    className="text-sm font-bold text-neutral-300 transition hover:text-rose-500 active:scale-95"
                                >
                                    Delete kids list
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}