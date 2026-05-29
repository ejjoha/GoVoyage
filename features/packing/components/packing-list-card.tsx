"use client";

import { useState } from "react";
import type {
    PackingList,
    PackingListItem,
} from "../types/packing.types";
import PackingItemRow from "./packing-item-row";
import AddPackingItemForm from "./add-packing-item-form";
import SmartSuggestionsPrompt from "./smart-suggestions-prompt";

type Props = {
    list: PackingList;
    items: PackingListItem[];
    tripDays: number;
    onToggleItem: (item: PackingListItem) => void;
    onCreateItem: (listId: string, item: PackingListItem) => void;
    onArchiveList: (listId: string) => void;
    onDecreaseQuantity: (item: PackingListItem) => void;
    onIncreaseQuantity: (item: PackingListItem) => void;
};

export default function PackingListCard({
    list,
    items,
    tripDays,
    onToggleItem,
    onCreateItem,
    onArchiveList,
    onDecreaseQuantity,
    onIncreaseQuantity,
}: Props) {
    const packedCount = items.filter((item) => item.packed).length;
    const totalCount = items.length;
    const [open, setOpen] = useState(false);

    return (
        <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="flex w-full items-start justify-between gap-4 px-5 pt-5 text-left"
            >
                <div>
                    <h2 className="text-2xl font-bold tracking-[-0.03em] text-neutral-950">
                        {list.emoji ? `${list.emoji} ` : ""}
                        {list.title}
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-500">
                        {packedCount}/{totalCount}
                    </div>

                    <span className="text-lg font-bold text-neutral-300">
                        {open ? "−" : "+"}
                    </span>
                </div>
            </button>

            {open && (
                <>
                    <div className="mt-4 divide-y divide-neutral-100 px-5 pb-3">
                        {items.length === 0 ? (
                            <SmartSuggestionsPrompt
                                list={list}
                                tripDays={tripDays}
                                onCreated={(createdItems) => {
                                    createdItems.forEach((item) => onCreateItem(list.id, item));
                                }}
                            />
                        ) : (
                            items.map((item) => (
                                <PackingItemRow
                                    key={item.id}
                                    item={item}
                                    onToggle={onToggleItem}
                                    onDecreaseQuantity={onDecreaseQuantity}
                                    onIncreaseQuantity={onIncreaseQuantity}
                                />
                            ))
                        )}
                    </div>

                    <div className="border-t border-neutral-100 px-5 pb-6 pt-4">
                        <AddPackingItemForm
                            packingListId={list.id}
                            onCreated={(item) => onCreateItem(list.id, item)}
                        />
                    </div>
                    <div className="mt-5 flex justify-end">
                        <button
                            type="button"
                            onClick={() => onArchiveList(list.id)}
                            className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-bold text-neutral-400 transition active:scale-95 hover:text-rose-500"
                        >
                            Remove list
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}