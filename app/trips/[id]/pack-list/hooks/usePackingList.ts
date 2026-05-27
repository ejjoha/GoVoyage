"use client";

import { useState } from "react";
import type { PackingItem } from "../packingSuggestions";

export function usePackingList() {
    const [items, setItems] = useState<PackingItem[]>([]);
    const [deletedItem, setDeletedItem] = useState<PackingItem | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState(false);

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

    function deleteItem(
        itemKey: string,
        options: { showUndo?: boolean } = { showUndo: true }
    ) {
        const itemToDelete = items.find((item) => item.key === itemKey);

        if (!itemToDelete) return;

        setItems((currentItems) =>
            currentItems.map((item) =>
                item.key === itemKey
                    ? {
                        ...item,
                        hidden: true,
                    }
                    : item
            )
        );

        if (!options.showUndo) {
            return;
        }

        setDeletedItem(itemToDelete);
        setDeleteSuccess(true);

        setTimeout(() => {
            setDeleteSuccess(false);
            setDeletedItem(null);
        }, 4000);
    }

    function undoDeleteItem() {
        if (!deletedItem) return;

        setItems((currentItems) =>
            currentItems.map((item) =>
                item.key === deletedItem.key
                    ? {
                        ...item,
                        hidden: false,
                    }
                    : item
            )
        );

        setDeletedItem(null);
        setDeleteSuccess(false);
    }

    return {
        items,
        setItems,
        deletedItem,
        deleteSuccess,
        toggleItem,
        decreaseQuantity,
        increaseQuantity,
        deleteItem,
        undoDeleteItem,
    };
}