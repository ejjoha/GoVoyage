"use client";

import type { PackingListItem } from "../types/packing.types";

type Props = {
    item: PackingListItem;
    onToggle: (item: PackingListItem) => void;
    onDecreaseQuantity: (item: PackingListItem) => void;
    onIncreaseQuantity: (item: PackingListItem) => void;
};

export default function PackingItemRow({
    item,
    onToggle,
    onDecreaseQuantity,
    onIncreaseQuantity,
}: Props) {
    return (
        <div className="flex w-full items-center gap-4 py-3">
            <button
                type="button"
                onClick={() => onToggle(item)}
                className={
                    item.packed
                        ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white"
                        : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white"
                }
            >
                {item.packed ? "✓" : ""}
            </button>

            <div className="min-w-0 flex-1">
                <p
                    className={
                        item.packed
                            ? "truncate text-neutral-400 line-through"
                            : "truncate text-neutral-850"
                    }
                >
                    {item.name}
                </p>

                <p className="mt-0.5 text-xs font-medium text-neutral-400">
                    {item.category}
                </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <button
                    type="button"
                    onClick={() => onDecreaseQuantity(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-neutral-600 transition active:scale-95"
                >
                    −
                </button>

                <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-neutral-50 px-2 text-sm font-bold text-neutral-700">
                    {item.quantity}
                </span>

                <button
                    type="button"
                    onClick={() => onIncreaseQuantity(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-neutral-600 transition active:scale-95"
                >
                    +
                </button>
            </div>
        </div>
    );
}