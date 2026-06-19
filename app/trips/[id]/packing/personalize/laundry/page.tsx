"use client";

import PersonalizeHero from "@/features/packing/components/personalize-hero";
import { updatePackingItemQuantity } from "@/features/packing/lib/packing-mutations";
import {
    getPackingItems,
    getPackingLists,
    getTripForPacking,
} from "@/features/packing/lib/packing-queries";
import {
    baseItems,
    getLaundryAwareQuantity,
    type LaundryAvailability,
} from "@/features/packing/lib/packing-template-engine";
import {
    getKidsLaundryQuantityUpdates,
    type KidsAgeGroup,
    type KidsLaundryAvailability,
} from "@/features/packing/lib/kids-packing-items";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const laundryOptions = [
    {
        value: "Available",
        emoji: "🧺",
        description: "Washing machine or laundromat nearby",
    },
    {
        value: "Hotel service",
        emoji: "🧼",
        description: "Laundry service may take 1–2 days",
    },
    {
        value: "Not available",
        emoji: "🧳",
        description: "Pack enough clothes for the full trip",
    },
];

function calculateTripDays(startDate?: string | null, endDate?: string | null) {
    if (!startDate || !endDate) return 1;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const differenceInMs = end.getTime() - start.getTime();
    const days = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24)) + 1;

    return Math.max(days, 1);
}

export default function LaundryPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const tripId = params.id;

    const [selected, setSelected] = useState("Not available");
    const [initialSelected, setInitialSelected] = useState("Not available");
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem(`packing-laundry-${tripId}`);

        if (!saved) return;

        setSelected(saved);
        setInitialSelected(saved);
    }, [tripId]);

    const hasChanges = selected !== initialSelected;

    async function handleSave() {
        if (!hasChanges || successMessage) return;

        localStorage.setItem(`packing-laundry-${tripId}`, selected);

        const lists = await getPackingLists(Number(tripId));

        const mainList = lists.find(
            (list) =>
                list.type === "personal" &&
                list.title === "My List" &&
                list.member_id === null
        );

        if (mainList) {
            const trip = await getTripForPacking(Number(tripId));
            const tripDays = calculateTripDays(trip.start_date, trip.end_date);
            const existingItems = await getPackingItems(mainList.id);

            const laundrySensitiveBaseItems = baseItems.filter((item) =>
                ["underwear", "socks", "t-shirts-or-tops"].includes(item.key)
            );

            await Promise.all(
                laundrySensitiveBaseItems.map(async (templateItem) => {
                    const existingItem = existingItems.find(
                        (item) =>
                            item.name.toLowerCase() === templateItem.name.toLowerCase() &&
                            item.category === templateItem.category
                    );

                    if (!existingItem) return;

                    const quantity = getLaundryAwareQuantity({
                        item: templateItem,
                        tripDays,
                        laundry: selected as LaundryAvailability,
                    });

                    await updatePackingItemQuantity({
                        itemId: existingItem.id,
                        quantity,
                    });
                })
            );
        }

        const kidsLists = lists.filter(
            (list) =>
                list.type === "shared" &&
                list.emoji === "🧸" &&
                !list.archived
        );

        if (kidsLists.length > 0) {
            const trip = await getTripForPacking(Number(tripId));
            const tripDays = calculateTripDays(trip.start_date, trip.end_date);

            for (const kidsList of kidsLists) {
                const existingItems = await getPackingItems(kidsList.id);

                const quantityUpdates = getKidsLaundryQuantityUpdates({
                    tripDays,
                    ageGroup: (kidsList.kids_age_group ?? "child") as KidsAgeGroup,
                    laundry: selected as KidsLaundryAvailability,
                    existingItems,
                });

                await Promise.all(
                    quantityUpdates.map((update) =>
                        updatePackingItemQuantity({
                            itemId: update.itemId,
                            quantity: update.quantity,
                        })
                    )
                );
            }
        }

        const laundryMessages: Record<string, string> = {
            Available: "We'll suggest fewer clothing backups because you can wash clothes during the trip.",
            "Hotel service": "We'll keep your list balanced and allow for a short laundry turnaround.",
            "Not available": "We'll suggest enough clothing to cover the full trip without laundry access.",
        };

        setSuccessMessage(laundryMessages[selected] ?? "Laundry preference saved.");
        setInitialSelected(selected);

        setTimeout(() => {
            router.push(`/trips/${tripId}/packing/personalize`);
        }, 2500);
    }

    return (
        <main className="packing-slide-up-page min-h-screen bg-[#f6f1e8] text-neutral-950">
            <div className="mx-auto max-w-md pb-24">
                <PersonalizeHero
                    href={`/trips/${tripId}/packing/personalize`}
                    title="Laundry"
                    description="Tell us if you can wash clothes during the trip."
                    imageSrc="/images/packing-personalize/laundry.png"
                    imageAlt="Laundry packing"
                />

                <div className="relative z-20 mx-5 -mt-16 overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_rgba(70,55,35,0.16)]">
                    <div className="px-5 pb-4 pt-6">
                        <h1 className="text-[24px] font-extrabold leading-none tracking-[-0.06em] text-neutral-950 drop-shadow-[0_8px_12px_rgba(70,55,35,0.10)]">
                            Laundry
                        </h1>

                        <p className="mt-3 text-[15px] leading-6 text-neutral-500">
                            Tell us if you can wash clothes during the trip.
                        </p>
                    </div>

                    <div className="mx-5 h-px bg-black/10" />
                    {laundryOptions.map((option, index) => {
                        const active = selected === option.value;
                        const isLast = index === laundryOptions.length - 1;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setSelected(option.value)}
                                className="relative flex min-h-[72px] w-full items-center bg-white px-5 text-left transition active:bg-neutral-50"
                            >
                                <div className="mr-[18px] flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.35rem] bg-neutral-100">
                                    <span className="text-[24px] leading-none">
                                        {option.emoji}
                                    </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-[16px] font-bold tracking-[-0.015em] text-neutral-950 drop-shadow-[0_4px_4px_rgba(70,55,35,0.12)]">
                                        {option.value}
                                    </p>

                                    <p className="mt-1.5 truncate text-[13px] font-normal text-black">
                                        {option.description}
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
                    disabled={!hasChanges || Boolean(successMessage)}
                    onClick={handleSave}
                    className={
                        hasChanges && !successMessage
                            ? "mx-5 mt-10 w-[calc(100%-2.5rem)] rounded-2xl bg-rose-500 px-5 py-3 text-base font-bold text-white shadow-[0_14px_28px_rgba(70,55,35,0.22)] active:scale-[0.98]"
                            : "mx-5 mt-10 w-[calc(100%-2.5rem)] rounded-2xl bg-neutral-300 px-5 py-3 text-base font-bold text-white shadow-[0_12px_24px_rgba(70,55,35,0.12)]"
                    }
                >
                    {successMessage ? "Saved" : "Save Laundry"}
                </button>

                {successMessage && (
                    <>
                        <div className="fixed inset-0 z-[70] bg-black/10 backdrop-blur-[3px]" />

                        <div className="fixed inset-0 z-[80] flex items-center justify-center px-5">
                            <div className="toast-in pointer-events-auto w-full max-w-sm rounded-[2rem] border border-white/70 bg-white/90 px-6 py-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.20)] backdrop-blur-xl">
                                <p className="text-base font-extrabold tracking-[-0.03em] text-neutral-950">
                                    Laundry saved
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