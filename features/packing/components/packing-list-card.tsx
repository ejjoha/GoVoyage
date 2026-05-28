"use client";

import type {
    PackingList,
    PackingListItem,
} from "../types/packing.types";
import PackingItemRow from "./packing-item-row";
import AddPackingItemForm from "./add-packing-item-form";

type Props = {
    list: PackingList;
    items: PackingListItem[];
    onToggleItem: (item: PackingListItem) => void;
    onCreateItem: (listId: string, item: PackingListItem) => void;
};

export default function PackingListCard({
    list,
    items,
    onToggleItem,
    onCreateItem,
}: Props) {
    const packedCount = items.filter((item) => item.packed).length;
    const totalCount = items.length;

    return (
        <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
            <div className="px-5 pt-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
                            {list.type}
                        </p>

                        <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-neutral-950">
                            {list.emoji ? `${list.emoji} ` : ""}
                            {list.title}
                        </h2>
                    </div>

                    <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-500">
                        {packedCount}/{totalCount}
                    </div>
                </div>
            </div>

            <div className="mt-4 divide-y divide-neutral-100 px-5 pb-3">
                {items.length === 0 ? (
                    <p className="py-5 text-sm font-medium text-neutral-400">
                        Nothing here yet.
                    </p>
                ) : (
                    items.map((item) => (
                        <PackingItemRow
                            key={item.id}
                            item={item}
                            onToggle={onToggleItem}
                        />
                    ))
                )}
            </div>
            <div className="border-t border-neutral-100 px-5 pb-5">
                <AddPackingItemForm
                    packingListId={list.id}
                    onCreated={(item) => onCreateItem(list.id, item)}
                />
            </div>
        </section>
    );
}