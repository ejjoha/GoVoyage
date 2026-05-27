"use client";

import { useState } from "react";
import type { PackingItem } from "../packingSuggestions";

export function usePackingList() {
    const [items, setItems] = useState<PackingItem[]>([]);

    function toggleItem(itemKey: string) {
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.key === itemKey
                    ? {
                        ...item,
                        packed: !item.packed,
                    }
                    : item
            )
        );
    }

    function decreaseQuantity(itemKey: string) {
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.key === itemKey
                    ? {
                        ...item,
                        quantity: item.quantity - 1,
                        protected: true,
                    }
                    : item
            )
        );
    }

    function increaseQuantity(itemKey: string) {
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.key === itemKey
                    ? {
                        ...item,
                        quantity: item.quantity + 1,
                        protected: true,
                    }
                    : item
            )
        );
    }

    return {
        items,
        setItems,
        toggleItem,
        decreaseQuantity,
        increaseQuantity,
    };
}