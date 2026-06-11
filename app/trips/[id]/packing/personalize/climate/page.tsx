"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
        value: "Rain",
        emoji: "🌧️",
        description: "Wet conditions and waterproof gear",
    },
    {
        value: "Snow",
        emoji: "🌨️",
        description: "Snowy ground or winter conditions",
    },
    {
        value: "Wind",
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
            className={
                active
                    ? "flex w-full items-center gap-5 bg-indigo-50 px-6 py-5 text-left transition active:scale-[0.99]"
                    : "flex w-full items-center gap-5 bg-white px-6 py-5 text-left transition active:bg-neutral-50"
            }
        >
            <span className="w-10 text-center text-2xl">
                {option.emoji}
            </span>

            <div className="min-w-0 flex-1">
                <p
                    className={
                        active
                            ? "text-2xl font-bold tracking-[-0.04em] text-indigo-800"
                            : "text-2xl font-bold tracking-[-0.04em] text-neutral-950"
                    }
                >
                    {option.value}
                </p>

                <p className="mt-1 text-sm leading-5 text-neutral-500">
                    {option.description}
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
}

export default function ClimatePage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const tripId = params.id;

    const [selected, setSelected] = useState<string[]>([]);
    const [initialSelected, setInitialSelected] = useState<string[]>([]);

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

    function handleSave() {
        localStorage.setItem(
            `packing-climate-${tripId}`,
            JSON.stringify(selected)
        );

        router.push(`/trips/${tripId}/packing/personalize`);
    }

    return (
        <main className="min-h-screen bg-[#f6f1e8]">
            <div className="mx-auto max-w-md px-5 py-8">
                <div className="flex items-center justify-between">
                    <Link
                        href={`/trips/${tripId}/packing/personalize`}
                        className="inline-flex items-center text-lg font-medium text-neutral-500"
                    >
                        ← Back
                    </Link>

                    <button
                        type="button"
                        disabled={!hasChanges}
                        onClick={handleSave}
                        className={
                            hasChanges
                                ? "text-lg font-bold text-indigo-600"
                                : "text-lg font-bold text-neutral-300"
                        }
                    >
                        Save
                    </button>
                </div>

                <h1 className="mt-12 text-5xl font-bold tracking-[-0.06em] text-neutral-950">
                    Climate & Conditions
                </h1>

                <p className="mt-4 text-xl leading-7 text-neutral-500">
                    Select the conditions you expect during this trip.
                </p>

                <div className="mt-10 overflow-hidden rounded-[2rem] bg-white shadow-[0_14px_40px_rgba(0,0,0,0.08)]">
                    <div className="px-6 pb-3 pt-6">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
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

                    <div className="border-t border-neutral-100 px-6 pb-3 pt-6">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
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
            </div>
        </main>
    );
}