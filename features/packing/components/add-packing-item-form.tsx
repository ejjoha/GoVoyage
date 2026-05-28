"use client";

import { useState } from "react";
import { createPackingItem } from "../lib/packing-mutations";
import type { PackingListItem } from "../types/packing.types";

type Props = {
    packingListId: string;
    onCreated: (item: PackingListItem) => void;
};

export default function AddPackingItemForm({
    packingListId,
    onCreated,
}: Props) {
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedName = name.trim();
        if (!trimmedName || saving) return;

        setSaving(true);

        try {
            const item = await createPackingItem({
                packingListId,
                name: trimmedName,
            });

            onCreated(item);
            setName("");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
            <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Add item"
                className="min-w-0 flex-1 rounded-full bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-900 outline-none placeholder:text-neutral-400"
            />

            <button
                type="submit"
                disabled={!name.trim() || saving}
                className="rounded-full bg-neutral-950 px-4 py-3 text-sm font-bold text-white transition active:scale-95 disabled:opacity-40"
            >
                {saving ? "Adding…" : "Add"}
            </button>
        </form>
    );
}