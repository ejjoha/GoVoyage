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

    return {
        items,
        setItems,
        toggleItem,
    };
}