"use client";

import { useMemo, useState } from "react";
import { createPackingList } from "../lib/packing-mutations";
import type { PackingList } from "../types/packing.types";

type Props = {
  tripId: number;
  existingLists: PackingList[];
  onCreated: (list: PackingList) => void;
};

const options = [
  {
    title: "My List",
    type: "personal" as const,
    emoji: "🧳",
  },
  {
    title: "Carry-on",
    type: "luggage" as const,
    emoji: "🎒",
  },
  {
    title: "Shared Bag",
    type: "shared" as const,
    emoji: "👜",
  },
  {
    title: "Kids List",
    type: "personal" as const,
    emoji: "🧸",
  },
];

export default function NewPackingListButton({
  tripId,
  existingLists,
  onCreated,
}: Props) {
  const [open, setOpen] = useState(false);
  const [creatingTitle, setCreatingTitle] = useState<string | null>(null);

  const availableOptions = useMemo(() => {
    const existingTitles = new Set(
      existingLists.map((list) => list.title.toLowerCase())
    );

    return options.filter(
      (option) => !existingTitles.has(option.title.toLowerCase())
    );
  }, [existingLists]);

  async function handleCreate(option: (typeof options)[number]) {
    if (creatingTitle) return;

    setCreatingTitle(option.title);

    try {
      const list = await createPackingList({
        tripId,
        title: option.title,
        type: option.type,
        emoji: option.emoji,
      });

      onCreated(list);
      setOpen(false);
    } finally {
      setCreatingTitle(null);
    }
  }

  if (availableOptions.length === 0) {
    return null;
  }

  return (
    <div className="relative mb-5">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition active:scale-95"
      >
        + New list
      </button>

      {open && (
        <div className="mt-3 rounded-[1.5rem] bg-white p-3 shadow-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            {availableOptions.map((option) => (
              <button
                key={option.title}
                type="button"
                onClick={() => handleCreate(option)}
                disabled={creatingTitle !== null}
                className="flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3 text-left transition hover:bg-neutral-100 active:scale-[0.98] disabled:opacity-50"
              >
                <span className="text-xl">{option.emoji}</span>

                <span>
                  <span className="block text-sm font-bold text-neutral-950">
                    {creatingTitle === option.title
                      ? "Creating…"
                      : option.title}
                  </span>

                  <span className="mt-0.5 block text-xs font-medium capitalize text-neutral-400">
                    {option.type}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}