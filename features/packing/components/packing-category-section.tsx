"use client";

import { useState } from "react";
import type { PackingListItem } from "../types/packing.types";
import PackingItemRow from "./packing-item-row";

type Props = {
    category: string;
    items: PackingListItem[];
    onToggleItem: (item: PackingListItem) => void;
    onDecreaseQuantity: (item: PackingListItem) => void;
    onIncreaseQuantity: (item: PackingListItem) => void;
    onRemoveItem: (item: PackingListItem) => void;
    resetSwipeKey: number;
};

export default function PackingCategorySection({
    category,
    items,
    onToggleItem,
    onDecreaseQuantity,
    onIncreaseQuantity,
    onRemoveItem,
    resetSwipeKey,

}: Props) {
    const [open, setOpen] = useState(true);

    const packedCount = items.filter((item) => item.packed).length;
    const totalCount = items.length;
    const progress =
        totalCount === 0 ? 0 : Math.round((packedCount / totalCount) * 100);
    const complete = totalCount > 0 && packedCount === totalCount;

    return (
        <section className="rounded-[1.25rem] bg-white px-5 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="flex w-full items-start justify-between gap-2 text-left"
            >
                <div className="min-w-0 flex-1">
                    <div>
                        <h3
                            className={
                                complete
                                    ? "text-lg font-bold tracking-[-0.03em] text-neutral-400"
                                    : "text-lg font-bold tracking-[-0.03em] text-neutral-950"
                            }
                        >
                            {category}
                        </h3>
                    </div>

                    <p className="mt-0.5 text-xs font-bold text-neutral-400">
                        {packedCount} of {totalCount} packed
                    </p>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-200/70">
                        <div
                            className="h-full rounded-full bg-rose-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <span
                    className={
                        complete
                            ? "rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-500"
                            : "rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-400"
                    }
                >
                    {progress}%
                </span>
            </button>

            {open && (
                <div className="mt-4 divide-y divide-neutral-200/60">
                    {items.map((item, index) => (
                        <PackingItemRow
                            key={item.id}
                            item={item}
                            onToggle={onToggleItem}
                            onDecreaseQuantity={onDecreaseQuantity}
                            onIncreaseQuantity={onIncreaseQuantity}
                            onRemove={onRemoveItem}
                            resetSwipeKey={resetSwipeKey}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}