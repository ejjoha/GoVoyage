"use client";

import { motion } from "framer-motion";
import type { PackingItem } from "../packingSuggestions";

type PackItemRowProps = {
    item: PackingItem;
    onToggle: (itemKey: string) => void;
    onDelete: (itemKey: string) => void;
    onRequestDelete: (item: PackingItem) => void;
    onDecreaseQuantity: (item: PackingItem) => void;
    onIncreaseQuantity: (item: PackingItem) => void;
};

export default function PackItemRow({
    item,
    onToggle,
    onDelete,
    onRequestDelete,
    onDecreaseQuantity,
    onIncreaseQuantity,
}: PackItemRowProps) {
    return (
        <div className="relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-end rounded-2xl bg-red-500 px-5 text-sm font-bold text-white">
                Delete
            </div>

            <motion.div
                drag="x"
                dragDirectionLock
                dragConstraints={{ left: -120, right: 0 }}
                dragElastic={0.08}
                whileTap={{ scale: 0.99 }}
                onDragEnd={(_, info) => {
                    if (info.offset.x < -80 || info.velocity.x < -500) {
                        onDelete(item.key);
                    }
                }}
                className="relative flex touch-pan-y items-center gap-4 bg-white px-1 py-3"
            >
                <input
                    type="checkbox"
                    checked={item.packed}
                    onChange={() => onToggle(item.key)}
                    onPointerDown={(event) => event.stopPropagation()}
                    className="h-4 w-4 rounded-md border-neutral-300"
                />

                <div className="flex flex-1 items-center justify-between gap-3">
                    <div>
                        <span
                            className={
                                item.packed
                                    ? "text-neutral-400 line-through"
                                    : "text-neutral-800"
                            }
                        >
                            {item.name}
                        </span>
                    </div>

                    <div
                        className="flex items-center gap-2"
                        onPointerDown={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                if (item.quantity <= 1) {
                                    onRequestDelete(item);
                                    return;
                                }

                                onDecreaseQuantity(item);
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-700 transition active:scale-95"
                        >
                            −
                        </button>

                        <span className="min-w-[22px] rounded-full bg-neutral-100 px-2 py-1 text-center text-xs font-semibold text-neutral-700">
                            {item.quantity}
                        </span>

                        <button
                            type="button"
                            onClick={() => onIncreaseQuantity(item)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-700 transition active:scale-95"
                        >
                            +
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}