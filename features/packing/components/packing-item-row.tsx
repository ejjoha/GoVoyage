"use client";

import type { PackingListItem } from "../types/packing.types";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

type Props = {
    item: PackingListItem;
    onToggle: (item: PackingListItem) => void;
    onDecreaseQuantity: (item: PackingListItem) => void;
    onIncreaseQuantity: (item: PackingListItem) => void;
    onRemove: (item: PackingListItem) => void;
    resetSwipeKey: number;
};

export default function PackingItemRow({
    item,
    onToggle,
    onDecreaseQuantity,
    onIncreaseQuantity,
    onRemove,
    resetSwipeKey,
}: Props) {
    const showQuantityControls = item.quantity > 1;

    const x = useMotionValue(0);
    useEffect(() => {
        animate(x, 0, {
            type: "spring",
            stiffness: 420,
            damping: 32,
        });
    }, [resetSwipeKey, x]);
    const deleteOpacity = useTransform(x, [-80, -20], [1, 0]);

    return (
        <div className="relative overflow-hidden">
            <motion.div
                style={{ opacity: deleteOpacity }}
                className="absolute right-0 top-1 bottom-1 flex w-20 items-center justify-center rounded-r-xl bg-rose-500"
            >
                <span className="text-xs font-bold text-white">
                    Remove
                </span>
            </motion.div>

            <motion.div
                drag="x"
                dragConstraints={{ left: -90, right: 0 }}
                dragElastic={0.08}
                style={{ x }}
                onDragEnd={(_, info) => {
                    if (info.offset.x < -70) {
                        animate(x, -90, {
                            type: "spring",
                            stiffness: 420,
                            damping: 32,
                        });

                        window.setTimeout(() => {
                            onRemove(item);
                        }, 250);

                        return;
                    }

                    animate(x, 0, {
                        type: "spring",
                        stiffness: 420,
                        damping: 32,
                    });
                }}
                className="relative z-10 flex w-full items-center gap-3 bg-white px-4 py-2.5"
            >
                <button
                    type="button"
                    onClick={() => onToggle(item)}
                    className={
                        item.packed
                            ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow-sm transition active:scale-95"
                            : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white transition active:scale-95"
                    }
                    aria-label={item.packed ? "Mark as unpacked" : "Mark as packed"}
                >
                    {item.packed ? "✓" : ""}
                </button>

                <button
                    type="button"
                    onClick={() => onToggle(item)}
                    className="min-w-0 flex-1 text-left"
                >
                    <p
                        className={
                            item.packed
                                ? "truncate text-sm font-medium text-neutral-400 line-through"
                                : "truncate text-sm font-medium text-neutral-900"
                        }
                    >
                        {item.name}
                    </p>

                    {!showQuantityControls && item.quantity > 1 && (
                        <p className="mt-0.5 text-xs font-semibold text-neutral-400">
                            Quantity {item.quantity}
                        </p>
                    )}
                </button>

                {showQuantityControls ? (
                    <div className="flex shrink-0 items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => onDecreaseQuantity(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-neutral-500 shadow-sm transition active:scale-95"
                        >
                            −
                        </button>

                        <span className="flex h-8 min-w-7 items-center justify-center text-sm font-bold text-neutral-700">
                            {item.quantity}
                        </span>

                        <button
                            type="button"
                            onClick={() => onIncreaseQuantity(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-neutral-500 shadow-sm transition active:scale-95"
                        >
                            +
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => onIncreaseQuantity(item)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-neutral-300 shadow-sm transition hover:text-neutral-600 active:scale-95"
                        aria-label="Increase quantity"
                    >
                        +
                    </button>
                )}
            </motion.div>
        </div>
    );
}