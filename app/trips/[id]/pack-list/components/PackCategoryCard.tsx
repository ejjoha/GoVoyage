"use client";

import PackItemRow from "./PackItemRow";
import type { PackingItem } from "../packingSuggestions";

type PackCategoryCardProps = {
    category: string;
    items: PackingItem[];
    isOpen: boolean;
    onToggleCategory: (category: string) => void;
    onToggleItem: (itemKey: string) => void;
    onDeleteItem: (itemKey: string) => void;
    onRequestDelete: (item: PackingItem) => void;
    onDecreaseQuantity: (item: PackingItem) => void;
    onIncreaseQuantity: (item: PackingItem) => void;
};

export default function PackCategoryCard({
    category,
    items,
    isOpen,
    onToggleCategory,
    onToggleItem,
    onDeleteItem,
    onRequestDelete,
    onDecreaseQuantity,
    onIncreaseQuantity,
}: PackCategoryCardProps) {
    const packedInCategory = items.filter((item) => item.packed).length;
    const totalInCategory = items.length;

    return (
        <div className="rounded-3xl bg-white px-5 py-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <button
                    type="button"
                    onClick={() => onToggleCategory(category)}
                    className="flex flex-1 items-center justify-between gap-4 text-left"
                >
                    <div>
                        <h2 className="text-lg font-bold text-neutral-950">
                            {category}
                        </h2>

                        <p className="mt-1 text-xs font-semibold text-neutral-400">
                            {packedInCategory} / {totalInCategory} packed
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-500">
                            {Math.round((packedInCategory / totalInCategory) * 100)}%
                        </div>

                        <img
                            src="/icons/chevron-down.svg"
                            alt=""
                            className={
                                isOpen
                                    ? "h-5 w-5 text-neutral-400 transition-transform"
                                    : "h-5 w-5 rotate-[-90deg] text-neutral-400 transition-transform"
                            }
                        />
                    </div>
                </button>
            </div>

            {isOpen && (
                <div className="mt-2 divide-y divide-neutral-100 border-t border-neutral-100">
                    {items.map((item) => (
                        <PackItemRow
                            key={item.key}
                            item={item}
                            onToggle={onToggleItem}
                            onDelete={onDeleteItem}
                            onRequestDelete={onRequestDelete}
                            onDecreaseQuantity={onDecreaseQuantity}
                            onIncreaseQuantity={onIncreaseQuantity}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}