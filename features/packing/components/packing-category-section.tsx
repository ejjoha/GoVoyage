"use client";

import type { PackingListItem } from "../types/packing.types";
import PackingItemRow from "./packing-item-row";

type Props = {
    category: string;
    items: PackingListItem[];
    onToggleItem: (item: PackingListItem) => void;
    onDecreaseQuantity: (item: PackingListItem) => void;
    onIncreaseQuantity: (item: PackingListItem) => void;
};

export default function PackingCategorySection({
    category,
    items,
    onToggleItem,
    onDecreaseQuantity,
    onIncreaseQuantity,
}: Props) {
    const packedCount = items.filter((item) => item.packed).length;
    const totalCount = items.length;
    const progress =
        totalCount === 0 ? 0 : Math.round((packedCount / totalCount) * 100);

    return (
        <section className="rounded-[1.5rem] bg-neutral-50 px-4 py-4">
            <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-base font-bold text-neutral-950">
                        {category}
                    </h3>

                    <p className="mt-0.5 text-xs font-semibold text-neutral-400">
                        {packedCount} / {totalCount} packed
                    </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-neutral-500 shadow-sm">
                    {progress}%
                </span>
            </div>

            <div className="divide-y divide-neutral-100">
                {items.map((item) => (
                    <PackingItemRow
                        key={item.id}
                        item={item}
                        onToggle={onToggleItem}
                        onDecreaseQuantity={onDecreaseQuantity}
                        onIncreaseQuantity={onIncreaseQuantity}
                    />
                ))}
            </div>
        </section>
    );
}