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
        <section className="mb-5">
            <div>
                <h2 className="text-3xl font-bold tracking-[-0.04em] text-neutral-950">
                    {list.title}
                </h2>

                <p className="mt-1 text-sm font-semibold text-neutral-400">
                    {packedCount} packed · {remainingCount} remaining
                </p>
            </div>
        </section>
    );
}