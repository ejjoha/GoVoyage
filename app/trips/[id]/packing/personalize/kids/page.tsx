"use client";

import PersonalizeHero from "@/features/packing/components/personalize-hero";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    createPackingList,
    createSuggestedPackingItems,
} from "@/features/packing/lib/packing-mutations";
import {
    getPackingLists,
    getTripForPacking,
} from "@/features/packing/lib/packing-queries";
import {
    getKidsStarterItems,
    type KidsAgeGroup,
} from "@/features/packing/lib/kids-packing-items";

function calculateTripDays(startDate?: string | null, endDate?: string | null) {
    if (!startDate || !endDate) return 1;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const differenceInMs = end.getTime() - start.getTime();
    const days = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24)) + 1;

    return Math.max(days, 1);
}

const ageOptions: Array<{
    value: KidsAgeGroup;
    label: string;
    description: string;
}> = [
        {
            value: "baby",
            label: "Baby",
            description: "Diapers, feeding items and stroller basics",
        },
        {
            value: "toddler",
            label: "Toddler",
            description: "Extra clothes, snacks, potty and comfort items",
        },
        {
            value: "child",
            label: "Child",
            description: "Clothes, snacks, games and everyday essentials",
        },
        {
            value: "teen",
            label: "Teen",
            description: "More independence, tech and personal items",
        },
    ];

export default function KidsPackingPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const tripId = Number(params.id);

    const [childName, setChildName] = useState("");
    const [ageGroup, setAgeGroup] = useState<KidsAgeGroup>("child");
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const trimmedChildName = childName.trim();
    const canCreate = trimmedChildName.length > 0 && !saving;

    async function handleCreateKidsList() {
        if (!canCreate) return;

        setSaving(true);
        setErrorMessage(null);

        try {
            const existingLists = await getPackingLists(tripId);

            const duplicateKidsList = existingLists.some(
                (list) =>
                    list.type === "shared" &&
                    list.emoji === "🧸" &&
                    list.title.trim().toLowerCase() === trimmedChildName.toLowerCase()
            );

            if (duplicateKidsList) {
                setErrorMessage(`You already have a kids list for ${trimmedChildName}.`);
                return;
            }

            const list = await createPackingList({
                tripId,
                title: trimmedChildName,
                type: "shared",
                emoji: "🧸",
                kidsAgeGroup: ageGroup,
            });

            const trip = await getTripForPacking(tripId);
            const tripDays = calculateTripDays(trip.start_date, trip.end_date);

            const savedClimate = localStorage.getItem(`packing-climate-${tripId}`);
            const climate = savedClimate ? JSON.parse(savedClimate) : [];

            const savedActivities = localStorage.getItem(`packing-activities-${tripId}`);
            const activities = savedActivities ? JSON.parse(savedActivities) : [];
            const savedLaundry = localStorage.getItem(`packing-laundry-${tripId}`);
            const laundry =
                savedLaundry === "Available" ||
                    savedLaundry === "Hotel service" ||
                    savedLaundry === "Not available"
                    ? savedLaundry
                    : "Not available";

            await createSuggestedPackingItems({
                packingListId: list.id,
                items: getKidsStarterItems({
                    tripDays,
                    ageGroup,
                    climate,
                    activities,
                    laundry,
                }),
            });

            router.push(`/trips/${tripId}/packing?list=${list.id}`);
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className="packing-slide-up-page min-h-screen bg-[#f6f1e8] text-neutral-950">
            <div className="mx-auto max-w-md pb-24">
                <PersonalizeHero
                    href={`/trips/${tripId}/packing/personalize`}
                    title="Traveling with Kids"
                    description="Create a dedicated packing list for your child and tailor it to their age and trip needs."
                    imageSrc="/images/packing-personalize/kids.jpg"
                    imageAlt="Traveling with kids packing"
                />

                <div className="relative z-20 mx-5 -mt-16 overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_rgba(70,55,35,0.16)]">
                    <div className="px-5 pb-4 pt-6">
                        <h1 className="text-[24px] font-extrabold leading-none tracking-[-0.06em] text-neutral-950 drop-shadow-[0_8px_12px_rgba(70,55,35,0.10)]">
                            Traveling with Kids
                        </h1>

                        <p className="mt-3 text-[15px] leading-6 text-neutral-500">
                            Create a dedicated packing list for your child and tailor it to their age and trip needs.
                        </p>
                    </div>

                    <div className="mx-5 h-px bg-black/10" />

                    <div className="p-6">

                        <label className="block text-sm font-bold text-neutral-700">
                            Child name
                        </label>

                        <input
                            type="text"
                            value={childName}
                            onChange={(event) => {
                                setChildName(event.target.value);
                                setErrorMessage(null);
                            }}
                            placeholder="e.g. Emma"
                            className="mt-3 w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-[13px] font-regular text-neutral-950 outline-none placeholder:text-neutral-300 focus:border-rose-300 focus:bg-white"
                        />

                        {errorMessage && (
                            <p className="mt-3 text-sm font-semibold text-rose-600">
                                {errorMessage}
                            </p>
                        )}
                        <div className="mt-8">
                            <p className="text-sm font-bold text-neutral-700">
                                Age group
                            </p>

                            <div className="mt-3 grid gap-2">
                                {ageOptions.map((option) => {
                                    const active = ageGroup === option.value;

                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setAgeGroup(option.value)}
                                            className={
                                                active
                                                    ? "rounded-2xl border border-black/10 bg-white px-4 py-3 text-left shadow-[0_8px_20px_rgba(70,55,35,0.08)]"
                                                    : "rounded-2xl border border-black/5 bg-neutral-50 px-4 py-3 text-left opacity-65 scale-[0.96]"
                                            }
                                        >
                                            <p className="text-sm font-extrabold text-neutral-950">
                                                {option.label}
                                            </p>

                                            <p className="mt-1 text-xs font-medium leading-5 text-neutral-500">
                                                {option.description}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <button
                            type="button"
                            disabled={!canCreate}
                            onClick={handleCreateKidsList}
                            className={
                                canCreate
                                    ? "mt-12 w-full rounded-2xl bg-rose-500 px-5 py-3 text-base font-bold text-white shadow-[0_14px_28px_rgba(70,55,35,0.22)] active:scale-[0.98]"
                                    : "mt-12 w-full rounded-2xl bg-neutral-300 px-5 py-3 text-base font-bold text-white shadow-[0_12px_24px_rgba(70,55,35,0.12)]"
                            }
                        >
                            {saving ? "Creating..." : "Create Kids List"}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}