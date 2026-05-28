"use client";

import type { PackingListItem } from "../types/packing.types";

type Props = {
    item: PackingListItem;
    onToggle: (item: PackingListItem) => void;
};

export default function PackingItemRow({ item, onToggle }: Props) {
    return (
        <button
            type="button"
            onClick={() => onToggle(item)}
            className="group flex w-full items-center gap-4 py-3 text-left"
        >
            <span
                className={
                    item.packed
                        ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white"
                        : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white"
                }
            >
                {item.packed ? "✓" : ""}
            </span>

            <span className="min-w-0 flex-1">
                <span
                    className={
                        item.packed
                            ? "block truncate text-neutral-400 line-through"
                            : "block truncate text-neutral-850"
                    }
                >
                    {item.name}
                </span>

                <span className="mt-0.5 block text-xs font-medium text-neutral-400">
                    {item.category}
                </span>
            </span>

            {item.quantity > 1 && (
                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-600">
                    {item.quantity}
                </span>
            )}
        </button>
    );
}