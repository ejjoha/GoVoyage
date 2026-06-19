"use client";

import PersonalizeHero from "@/features/packing/components/personalize-hero";
import BackButton from "@/components/ui/back-button";
import { createSuggestedPackingItems } from "@/features/packing/lib/packing-mutations";
import {
    getPackingItems,
    getPackingLists,
    getTripForPacking,
} from "@/features/packing/lib/packing-queries";
import { getClimatePackingItems } from "@/features/packing/lib/packing-profile-recommendations";
import {
    getKidsClimatePackingItems,
    type KidsAgeGroup,
} from "@/features/packing/lib/kids-packing-items";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const temperatureOptions = [
    {
        value: "Hot weather",
        emoji: "🔥",
        description: "Sun, heat and light clothing",
    },
    {
        value: "Warm",
        emoji: "☀️",
        description: "Comfortable temperatures and light layers",
    },
    {
        value: "Cool weather",
        emoji: "🌤️",
        description: "Mild but cooler days",
    },
    {
        value: "Cold weather",
        emoji: "❄️",
        description: "Warm layers and jacket weather",
    },
    {
        value: "Freezing",
        emoji: "🥶",
        description: "Winter gear and serious warmth",
    },
];

const conditionOptions = [
    {
        value: "Rainy",
        emoji: "🌧️",
        description: "Wet conditions and waterproof gear",
    },
    {
        value: "Snowy",
        emoji: "🌨️",
        description: "Snowy ground or winter conditions",
    },
    {
        value: "Windy",
        emoji: "💨",
        description: "Windy days and exposed places",
    },
    {
        value: "Humid",
        emoji: "💦",
        description: "Sticky heat and breathable clothing",
    },
    {
        value: "Dry",
        emoji: "🏜️",
        description: "Dry air, sun and hydration",
    },
    {
        value: "Mountains",
        emoji: "🏔️",
        description: "Altitude, layers and changing weather",
    },
];

type ClimateOption = {
    value: string;
    emoji: string;
    description: string;
};

function calculateTripDays(startDate?: string | null, endDate?: string | null) {
    if (!startDate || !endDate) return 1;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const differenceInMs = end.getTime() - start.getTime();
    const days = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24)) + 1;

    return Math.max(days, 1);
}

function ClimateRow({
    option,
    active,
    isLast,
    onToggle,
}: {
    option: ClimateOption;
    active: boolean;
    isLast: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            key={option.value}
            type="button"
            onClick={onToggle}
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
}

export default function ClimatePage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const tripId = params.id;

    const [selected, setSelected] = useState<string[]>([]);
    const [initialSelected, setInitialSelected] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem(`packing-climate-${tripId}`);

        if (!saved) {
            setSelected([]);
            setInitialSelected([]);
            return;
        }

        const parsed = JSON.parse(saved);

        setSelected(parsed);
        setInitialSelected(parsed);
    }, [tripId]);

    const hasChanges =
        JSON.stringify(selected) !== JSON.stringify(initialSelected);

    function toggleCondition(condition: string) {
        setSelected((current) =>
            current.includes(condition)
                ? current.filter((item) => item !== condition)
                : [...current, condition]
        );
    }

    async function handleSave() {
        if (!hasChanges || saving || successMessage) return;

        setSaving(true);

        localStorage.setItem(
            `packing-climate-${tripId}`,
            JSON.stringify(selected)
        );

        let addedCount = 0;

        const lists = await getPackingLists(Number(tripId));

        const mainList = lists.find(
            (list) =>
                list.type === "personal" &&
                list.title === "My List" &&
                list.member_id === null
        );

        if (mainList) {
            const existingItems = await getPackingItems(mainList.id);

            const itemsToCreate = getClimatePackingItems({
                climate: selected,
                existingItems,
            });

            if (itemsToCreate.length > 0) {
                await createSuggestedPackingItems({
                    packingListId: mainList.id,
                    items: itemsToCreate,
                });

                addedCount += itemsToCreate.length;
            }
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

                const itemsToCreate = getKidsClimatePackingItems({
                    tripDays,
                    ageGroup: (kidsList.kids_age_group ?? "child") as KidsAgeGroup,
                    climate: selected,
                    existingItems,
                });

                if (itemsToCreate.length > 0) {
                    await createSuggestedPackingItems({
                        packingListId: kidsList.id,
                        items: itemsToCreate,
                    });

                    addedCount += itemsToCreate.length;
                }
            }
        }

        const climateCount = selected.length;

        if (climateCount === 0) {
            setSuccessMessage(
                "We'll keep your packing list neutral without weather-specific extras."
            );
        } else if (addedCount > 0) {
            setSuccessMessage(
                `We'll tailor your list around ${climateCount} selected ${climateCount === 1 ? "condition" : "conditions"} and added ${addedCount} new ${addedCount === 1 ? "recommendation" : "recommendations"}.`
            );
        } else {
            setSuccessMessage(
                `We'll tailor your list around ${climateCount} selected ${climateCount === 1 ? "condition" : "conditions"}. No new recommendations were needed.`
            );
        }

        setInitialSelected(selected);
        setSaving(false);

        setTimeout(() => {
            router.push(`/trips/${tripId}/packing/personalize`);
        }, 2500);
    }

    return (
        <main className="packing-slide-up-page min-h-screen bg-[#f6f1e8] text-neutral-950">
            <div className="mx-auto max-w-md pb-24">
                <PersonalizeHero
                    href={`/trips/${tripId}/packing/personalize`}
                    title="Climate & Conditions"
                    description="Select the weather and conditions you expect during this trip."
                    imageSrc="/images/packing-personalize/climate.png"
                    imageAlt="Climate and weather packing"
                />

                <div className="relative z-20 mx-5 -mt-16 overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_rgba(70,55,35,0.16)]">
                    <div className="px-5 pb-4 pt-6">
                        <h1 className="text-[24px] font-extrabold leading-none tracking-[-0.06em] text-neutral-950 drop-shadow-[0_8px_12px_rgba(70,55,35,0.10)]">
                            Climate & Conditions
                        </h1>

                        <p className="mt-3 text-[15px] leading-6 text-neutral-500">
                            Select the weather and conditions you expect during this trip.
                        </p>
                    </div>

                    <div className="mx-5 h-px bg-black/10" />
                    <div className="px-5 pb-3 pt-5">
                        <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#8C6F45]">
                            Temperature
                        </p>
                    </div>

                    {temperatureOptions.map((option, index) => (
                        <ClimateRow
                            key={option.value}
                            option={option}
                            active={selected.includes(option.value)}
                            isLast={index === temperatureOptions.length - 1}
                            onToggle={() => toggleCondition(option.value)}
                        />
                    ))}

                    <div className="border-t border-black/10 px-5 pb-3 pt-5">
                        <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#8C6F45]">
                            Conditions
                        </p>
                    </div>

                    {conditionOptions.map((option, index) => (
                        <ClimateRow
                            key={option.value}
                            option={option}
                            active={selected.includes(option.value)}
                            isLast={index === conditionOptions.length - 1}
                            onToggle={() => toggleCondition(option.value)}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    disabled={!hasChanges || saving || Boolean(successMessage)}
                    onClick={handleSave}
                    className={
                        hasChanges && !saving && !successMessage
                            ? "mx-5 mt-10 w-[calc(100%-2.5rem)] rounded-2xl bg-rose-500 px-5 py-3 text-base font-bold text-white shadow-[0_14px_28px_rgba(70,55,35,0.22)] active:scale-[0.98]"
                            : "mx-5 mt-10 w-[calc(100%-2.5rem)] rounded-2xl bg-neutral-300 px-5 py-3 text-base font-bold text-white shadow-[0_12px_24px_rgba(70,55,35,0.12)]"
                    }
                >
                    {saving || successMessage ? "Saved" : "Save Climate"}
                </button>

                {successMessage && (
                    <>
                        <div className="fixed inset-0 z-[70] bg-black/10 backdrop-blur-[3px]" />

                        <div className="fixed inset-0 z-[80] flex items-center justify-center px-5">
                            <div className="toast-in pointer-events-auto w-full max-w-sm rounded-[2rem] border border-white/70 bg-white/90 px-6 py-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.20)] backdrop-blur-xl">
                                <p className="text-base font-extrabold tracking-[-0.03em] text-neutral-950">
                                    Climate saved
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