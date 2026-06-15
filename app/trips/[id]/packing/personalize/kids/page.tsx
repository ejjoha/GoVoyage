"use client";

import BackButton from "@/components/ui/back-button";
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

            router.push(`/trips/${tripId}/packing?list=${list.id}`);
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className="packing-slide-up-page min-h-screen bg-[#f6f1e8] text-neutral-950">
            <div className="mx-auto max-w-md px-5 py-14">
                <BackButton
                    href={`/trips/${tripId}/packing/personalize`}
                    ariaLabel="Go back"
                />

                <div className="mt-12 rounded-[2rem] bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.08)]">
                    <div className="text-6xl drop-shadow-[0_12px_6px_rgba(70,55,35,0.22)]">
                        🧸
                    </div>

                    <h1 className="mt-8 text-[18px] font-bold tracking-[-0.06em] text-neutral-950 drop-shadow-[0_10px_4px_rgba(70,55,35,0.12)]">
                        Traveling with Kids
                    </h1>

                    <p className="mt-2 text-[14px] leading-7 text-neutral-black">
                        Create a dedicated packing list for your child and invite someone to help.
                    </p>

                    <button
                        type="button"
                        disabled={saving}
                        onClick={handleCreateKidsList}
                        className={
                            saving
                                ? "mt-12 w-full rounded-2xl bg-rose-600 px-5 py-3 text-base font-bold text-white shadow-[0_12px_24px_rgba(70,55,35,0.18)]"
                                : "mt-12 w-full rounded-2xl bg-rose-500 px-5 py-3 text-base font-bold text-white shadow-[0_14px_28px_rgba(70,55,35,0.22)] active:scale-[0.98]"
                        }
                    >
                        {saving ? "Creating..." : "Create Kids List"}
                    </button>
                </div>
            </div>
        </main>
    );
}