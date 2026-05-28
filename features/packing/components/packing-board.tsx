"use client";

import { useEffect, useState } from "react";

import {
    getPackingItems,
    getPackingLists,
} from "../lib/packing-queries";

import type {
    PackingList,
    PackingListItem,
} from "../types/packing.types";

type Props = {
    tripId: number;
};

export default function PackingBoard({ tripId }: Props) {
    const [lists, setLists] = useState<PackingList[]>([]);
    const [itemsByList, setItemsByList] = useState<
        Record<string, PackingListItem[]>
    >({});

    useEffect(() => {
        async function loadPacking() {
            const packingLists = await getPackingLists(tripId);

            setLists(packingLists);

            const itemEntries = await Promise.all(
                packingLists.map(async (list) => {
                    const items = await getPackingItems(list.id);
                    return [list.id, items] as const;
                })
            );

            setItemsByList(Object.fromEntries(itemEntries));
        }

        loadPacking();
    }, [tripId]);

    return (
        <div className="mx-auto max-w-2xl px-4 py-6">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-950">
                Packing
            </h1>

            <div className="mt-6 space-y-4">
                {lists.length === 0 && (
                    <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
                        <p className="text-sm font-medium text-neutral-500">
                            No packing lists yet.
                        </p>
                    </div>
                )}

                {lists.map((list) => {
                    const items = itemsByList[list.id] ?? [];
                    const packedCount = items.filter((item) => item.packed).length;
                    const totalCount = items.length;

                    return (
                        <section
                            key={list.id}
                            className="rounded-3xl bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
                                        {list.type}
                                    </p>

                                    <h2 className="mt-1 text-xl font-bold text-neutral-950">
                                        {list.emoji ? `${list.emoji} ` : ""}
                                        {list.title}
                                    </h2>
                                </div>

                                <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-500">
                                    {packedCount}/{totalCount}
                                </div>
                            </div>

                            <div className="mt-4 divide-y divide-neutral-100">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-4 py-3"
                                    >
                                        <div>
                                            <p
                                                className={
                                                    item.packed
                                                        ? "text-neutral-400 line-through"
                                                        : "text-neutral-800"
                                                }
                                            >
                                                {item.name}
                                            </p>

                                            <p className="mt-0.5 text-xs font-medium text-neutral-400">
                                                {item.category}
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700">
                                            {item.quantity}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}