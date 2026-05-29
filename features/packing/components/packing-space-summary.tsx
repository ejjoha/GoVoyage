"use client";

import type {
    PackingList,
    PackingListItem,
} from "../types/packing.types";

type Props = {
    list: PackingList;
    items: PackingListItem[];
};

export default function PackingSpaceSummary({
    list,
    items,
}: Props) {
    const packedCount = items.filter((item) => item.packed).length;
    const remainingCount = items.filter((item) => !item.packed).length;

    return (
        <section className="mb-5 rounded-[2rem] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <span className="text-2xl">
                    {list.emoji ?? "🧳"}
                </span>

                <div>
                    <h2 className="text-2xl font-bold tracking-[-0.04em] text-neutral-950">
                        {list.title}
                    </h2>

                    <p className="text-sm font-semibold text-neutral-400">
                        {packedCount} packed · {remainingCount} remaining
                    </p>
                </div>
            </div>
        </section>
    );
}