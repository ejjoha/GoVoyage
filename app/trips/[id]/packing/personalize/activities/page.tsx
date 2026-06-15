"use client";

import { getPackingItems, getPackingLists } from "@/features/packing/lib/packing-queries";
import { createSuggestedPackingItems } from "@/features/packing/lib/packing-mutations";
import { getActivityPackingItems } from "@/features/packing/lib/packing-profile-recommendations";
import { useEffect } from "react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BackButton from "@/components/ui/back-button";

const activityOptions = [
    { value: "Beach", emoji: "🏖️" },
    { value: "Nightlife", emoji: "🍸" },
    { value: "Hiking", emoji: "🥾" },
    { value: "City walks", emoji: "🏙️" },
    { value: "Fine dining", emoji: "🍽️" },
    { value: "Swimming", emoji: "🏊" },
    { value: "Museums", emoji: "🖼️" },
    { value: "Shopping", emoji: "🛍️" },
    { value: "Business meetings", emoji: "💼" },
];

export default function ActivitiesPage() {
    const params = useParams<{ id: string }>();
    const tripId = params.id;
    const router = useRouter();

    const [selected, setSelected] = useState<string[]>([]);
    const [initialSelected, setInitialSelected] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [addedCount, setAddedCount] = useState<number | null>(null);

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

    return (
        <main className="packing-slide-up-page min-h-screen bg-[#f6f1e8] text-neutral-950">
            <div className="mx-auto max-w-md px-5 py-8">
                {addedCount !== null && (
                    <div className="mb-6 rounded-2xl bg-green-50 p-4 text-center">
                        <p className="font-semibold text-green-800">
                            Added {addedCount} recommendation{addedCount === 1 ? "" : "s"}
                        </p>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <BackButton href={`/trips/${tripId}/packing/personalize`} ariaLabel="Go back" />
                    <button
                        type="button"
                        disabled={!hasChanges}
                        onClick={async () => {
                            setSaving(true);
                            localStorage.setItem(
                                `packing-activities-${tripId}`,
                                JSON.stringify(selected)
                            );

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

                                    setAddedCount(itemsToCreate.length);
                                } else {
                                    setAddedCount(0);
                                }
                            }

                            setTimeout(() => {
                                router.push(`/trips/${tripId}/packing/personalize`);
                            }, 1500);
                        }}
                        className={
                            hasChanges
                                ? "text-lg font-bold text-indigo-600"
                                : "text-lg font-bold text-neutral-300"
                        }
                    >
                        {saving ? "Updating..." : "Save"}
                    </button>
                </div>

                <h1 className="mt-12 text-5xl font-bold tracking-[-0.06em] text-neutral-950">
                    Activities
                </h1>

                <p className="mt-4 text-xl leading-7 text-neutral-500">
                    Select everything that applies.
                </p>

                <div className="mt-10 overflow-hidden rounded-[2rem] bg-white shadow-[0_14px_40px_rgba(0,0,0,0.08)]">
                    {activityOptions.map((activity, index) => {
                        const active = selected.includes(activity.value);
                        const isLast = index === activityOptions.length - 1;

                        return (
                            <button
                                key={activity.value}
                                type="button"
                                onClick={() => toggleActivity(activity.value)}
                                className={
                                    active
                                        ? "flex w-full items-center gap-5 bg-indigo-50 px-6 py-5 text-left transition active:scale-[0.99]"
                                        : "flex w-full items-center gap-5 bg-white px-6 py-5 text-left transition active:bg-neutral-50"
                                }
                            >
                                <span className="w-10 text-center text-2xl">
                                    {activity.emoji}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p
                                        className={
                                            active
                                                ? "text-2xl font-bold tracking-[-0.04em] text-indigo-800"
                                                : "text-2xl font-bold tracking-[-0.04em] text-neutral-950"
                                        }
                                    >
                                        {activity.value}
                                    </p>

                                    {!isLast && (
                                        <div className="mt-5 h-px bg-neutral-200" />
                                    )}
                                </div>

                                <span
                                    className={
                                        active
                                            ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white"
                                            : "h-10 w-10 shrink-0 rounded-full bg-neutral-100"
                                    }
                                >
                                    {active ? "✓" : ""}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}