"use client";

import BackButton from "@/components/ui/back-button";
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

                    <label className="mt-8 block text-sm font-bold text-neutral-700">
                        Child name
                    </label>

                    <input
                        type="text"
                        value={childName}
                        onChange={(event) => {
                            setChildName(event.target.value);
                            setErrorMessage(null);
                        }}
                        placeholder="Emma"
                        className="mt-3 w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-base font-bold text-neutral-950 outline-none focus:border-rose-300 focus:bg-white"
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
                                                ? "rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-left shadow-[0_10px_24px_rgba(244,63,94,0.12)]"
                                                : "rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-left"
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
        </main>
    );
}