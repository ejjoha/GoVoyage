"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    createPackingList,
    createSuggestedPackingItems,
} from "@/features/packing/lib/packing-mutations";
import { kidsStarterItems } from "@/features/packing/lib/kids-packing-items";

export default function KidsPackingPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const tripId = Number(params.id);

    const [saving, setSaving] = useState(false);

    async function handleCreateKidsList() {
        if (saving) return;

        setSaving(true);

        try {
            const list = await createPackingList({
                tripId,
                title: "Kids List",
                type: "shared",
                emoji: "🧸",
            });

            await createSuggestedPackingItems({
                packingListId: list.id,
                items: kidsStarterItems,
            });

            router.push(`/trips/${tripId}/packing`);
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#f6f1e8]">
            <div className="mx-auto max-w-md px-5 py-8">
                <Link
                    href={`/trips/${tripId}/packing/personalize`}
                    className="inline-flex items-center text-lg font-medium text-neutral-500"
                >
                    ← Back
                </Link>

                <div className="mt-12 rounded-[2rem] bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.08)]">
                    <div className="text-5xl">🧸</div>

                    <h1 className="mt-6 text-4xl font-bold tracking-[-0.06em] text-neutral-950">
                        Traveling with Kids
                    </h1>

                    <p className="mt-4 text-lg leading-7 text-neutral-500">
                        Create a shared packing list for your children so everyone
                        can help keep track of what needs to be packed.
                    </p>

                    <button
                        type="button"
                        disabled={saving}
                        onClick={handleCreateKidsList}
                        className={
                            saving
                                ? "mt-8 w-full rounded-2xl bg-neutral-300 px-5 py-4 text-base font-bold text-white"
                                : "mt-8 w-full rounded-2xl bg-neutral-950 px-5 py-4 text-base font-bold text-white active:scale-[0.98]"
                        }
                    >
                        {saving ? "Creating..." : "Create Kids List"}
                    </button>
                </div>
            </div>
        </main>
    );
}