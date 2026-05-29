"use client";

import type { PackingListItem } from "../types/packing.types";

type Props = {
    items: PackingListItem[];
};

export default function PackingFocusCard({ items }: Props) {
    const PRIORITY_CATEGORIES = [
        "Essentials",
        "Documents",
        "Tech",
    ];

    const focusItems = items
        .filter((item) => !item.packed)
        .sort((a, b) => {
            const aPriority = PRIORITY_CATEGORIES.indexOf(a.category ?? "");
            const bPriority = PRIORITY_CATEGORIES.indexOf(b.category ?? "");

            const aScore = aPriority === -1 ? 999 : aPriority;
            const bScore = bPriority === -1 ? 999 : bPriority;

            return aScore - bScore;
        })
        .slice(0, 3);

    if (focusItems.length === 0) return null;

    return (
        <section className="mb-6 rounded-[2rem] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-neutral-400">
                Today's Focus
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-neutral-950">
                What matters next
            </h2>

            <div className="mt-4 space-y-3">
                {focusItems.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-3"
                    >
                        <div className="h-5 w-5 rounded-full border border-neutral-300 bg-neutral-50" />

                        <p className="text-base font-semibold text-neutral-800">
                            {item.name}
                        </p>
                    </div>
                ))}
            </div>

            <p className="mt-5 text-sm font-semibold text-neutral-400">
                {focusItems.length} important{" "}
                {focusItems.length === 1 ? "item" : "items"} remaining
            </p>
        </section>
    );
}