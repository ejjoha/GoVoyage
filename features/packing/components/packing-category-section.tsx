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

    return (
        <section>
            <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold tracking-[-0.03em] text-neutral-950">
                        {category}
                    </h3>

                    <p className="mt-0.5 text-xs font-bold text-neutral-400">
                        {packedCount} of {totalCount} packed
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] bg-neutral-50">
                {items.map((item, index) => (
                    <PackingItemRow
                        key={item.id}
                        item={item}
                        isLast={index === items.length - 1}
                        onToggle={onToggleItem}
                        onDecreaseQuantity={onDecreaseQuantity}
                        onIncreaseQuantity={onIncreaseQuantity}
                    />
                ))}
            </div>
        </section>
    );
}