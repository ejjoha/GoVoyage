"use client";

import { useState } from "react";
import type { PackingItem } from "../packingSuggestions";

export function usePackingList() {
    const [items, setItems] = useState<PackingItem[]>([]);

    return {
        items,
        setItems,
    };
}