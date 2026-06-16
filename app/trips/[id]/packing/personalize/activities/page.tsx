"use client";

import BackButton from "@/components/ui/back-button";
import { createSuggestedPackingItems } from "@/features/packing/lib/packing-mutations";
import { getPackingItems, getPackingLists } from "@/features/packing/lib/packing-queries";
import { getActivityPackingItems } from "@/features/packing/lib/packing-profile-recommendations";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const activityOptions = [
    {
        value: "Beach",
        emoji: "🏖️",
        description: "Beach days, sun, sand and swimwear",
    },
    {
        value: "Nightlife",
        emoji: "🍸",
        description: "Evening outfits and going-out essentials",
    },
    {
        value: "Hiking",
        emoji: "🥾",
        description: "Trail gear, layers and outdoor basics",
    },
    {
        value: "City walks",
        emoji: "🏙️",
        description: "Comfortable shoes and day-out essentials",
    },
    {
        value: "Fine dining",
        emoji: "🍽️",
        description: "Dressier clothes and polished details",
    },
    {
        value: "Swimming",
        emoji: "🏊",
        description: "Swimwear, towels and water-friendly items",
    },
    {
        value: "Museums",
        emoji: "🖼️",
        description: "Comfortable daywear and light carry items",
    },
    {
        value: "Shopping",
        emoji: "🛍️",
        description: "Room for purchases and practical day gear",
    },
    {
        value: "Business meetings",
        emoji: "💼",
        description: "Workwear, documents and professional essentials",
    },
];

export default function ActivitiesPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const tripId = params.id;

    const [selected, setSelected] = useState<string[]>([]);
    const [initialSelected, setInitialSelected] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    function toggleActivity(activity: string) {
        setSelected((current) =>
            current.includes(activity)
                ? current.filter((item) => item !== activity)
                : [...current, activity]
        );
    }

    useEffect(() => {
        const saved = localStorage.getItem(
            `packing-activities-${tripId}`
        );

        if (!saved) {
            const defaults: string[] = [];

            setSelected(defaults);
            setInitialSelected(defaults);
            return;
        }

        const parsed = JSON.parse(saved);

        setSelected(parsed);
        setInitialSelected(parsed);
    }, [tripId]);

    const hasChanges =
        JSON.stringify(selected) !==
        JSON.stringify(initialSelected);

    async function handleSave() {
        if (!hasChanges || saving || successMessage) return;

        setSaving(true);

        localStorage.setItem(
            `packing-activities-${tripId}`,
            JSON.stringify(selected)
        );

        let addedCount = 0;

        const lists = await getPackingLists(Number(tripId));
        const mainList = lists[0];

        if (mainList) {
            const existingItems = await getPackingItems(mainList.id);

            const itemsToCreate = getActivityPackingItems({
                activities: selected,
                existingItems,
            });

            if (itemsToCreate.length > 0) {
                await createSuggestedPackingItems({
                    packingListId: mainList.id,
                    items: itemsToCreate,
                });

                addedCount = itemsToCreate.length;
            }
        }

        const activityCount = selected.length;

        if (activityCount === 0) {
            setSuccessMessage(
                "We'll keep your packing list focused without activity-specific extras."
            );
        } else if (addedCount > 0) {
            setSuccessMessage(
                `We'll tailor your list around ${activityCount} selected ${activityCount === 1 ? "activity" : "activities"} and added ${addedCount} new ${addedCount === 1 ? "recommendation" : "recommendations"}.`
            );
        } else {
            setSuccessMessage(
                `We'll tailor your list around ${activityCount} selected ${activityCount === 1 ? "activity" : "activities"}. No new recommendations were needed.`
            );
        }

        setTimeout(() => {
            router.push(`/trips/${tripId}/packing/personalize`);
        }, 2500);
    }

    return (
        <main className="packing-slide-up-page min-h-screen bg-[#f6f1e8] text-neutral-950">
            <div className="mx-auto max-w-md px-5 py-8">
                <div className="flex items-center justify-between">
                    <BackButton
                        href={`/trips/${tripId}/packing/personalize`}
                        ariaLabel="Go back"
                    />
                </div>

                <h1 className="mt-12 text-[22px] font-bold tracking-[-0.06em] text-neutral-950 drop-shadow-[0_10px_4px_rgba(70,55,35,0.12)]">
                    Activities
                </h1>

                <p className="mt-4 text-[16px] leading-7 text-black">
                    Select everything that applies.
                </p>

                <div className="mt-10 overflow-hidden rounded-[1.5rem] bg-white shadow-[0_18px_45px_rgba(70,55,35,0.06)]">
                    {activityOptions.map((activity, index) => {
                        const active = selected.includes(activity.value);
                        const isLast = index === activityOptions.length - 1;

                        return (
                            <button
                                key={activity.value}
                                type="button"
                                onClick={() => toggleActivity(activity.value)}
                                className="relative flex min-h-[72px] w-full items-center bg-white px-5 text-left transition active:bg-neutral-50"
                            >
                                <div className="mr-[18px] flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.35rem] bg-neutral-100">
                                    <span className="text-[24px] leading-none">
                                        {activity.emoji}
                                    </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-[16px] font-bold tracking-[-0.015em] text-neutral-950 drop-shadow-[0_4px_4px_rgba(70,55,35,0.12)]">
                                        {activity.value}
                                    </p>

                                    <p className="mt-1.5 truncate text-[13px] font-normal text-black">
                                        {activity.description}
                                    </p>
                                </div>

                                <span
                                    className={
                                        active
                                            ? "ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white"
                                            : "ml-3 h-6 w-6 shrink-0 rounded-full bg-neutral-100"
                                    }
                                >
                                    {active ? "✓" : ""}
                                </span>

                                {!isLast && (
                                    <div className="absolute bottom-0 left-5 right-5 h-px bg-black/10" />
                                )}
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    disabled={!hasChanges || saving || Boolean(successMessage)}
                    onClick={handleSave}
                    className={
                        hasChanges && !saving && !successMessage
                            ? "mt-12 w-full rounded-2xl bg-rose-500 px-5 py-3 text-base font-bold text-white shadow-[0_14px_28px_rgba(70,55,35,0.22)] active:scale-[0.98]"
                            : "mt-12 w-full rounded-2xl bg-neutral-300 px-5 py-3 text-base font-bold text-white shadow-[0_12px_24px_rgba(70,55,35,0.12)]"
                    }
                >
                    {saving || successMessage ? "Saved" : "Save Activities"}
                </button>

                {successMessage && (
                    <>
                        <div className="fixed inset-0 z-[70] bg-black/10 backdrop-blur-[3px]" />

                        <div className="fixed inset-0 z-[80] flex items-center justify-center px-5">
                            <div className="toast-in pointer-events-auto w-full max-w-sm rounded-[2rem] border border-white/70 bg-white/90 px-6 py-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.20)] backdrop-blur-xl">
                                <p className="text-base font-extrabold tracking-[-0.03em] text-neutral-950">
                                    Activities saved
                                </p>

                                <p className="mt-2 text-sm font-medium leading-5 text-neutral-500">
                                    {successMessage}
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}