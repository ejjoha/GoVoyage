"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const laundryOptions = [
    {
        value: "Available",
        emoji: "✅",
        description: "Washing machine or laundromat nearby",
    },
    {
        value: "Hotel service",
        emoji: "🏨",
        description: "Laundry service may take 1–2 days",
    },
    {
        value: "Not available",
        emoji: "❌",
        description: "Pack enough clothes for the full trip",
    },
];

export default function LaundryPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const tripId = params.id;

    const [selected, setSelected] = useState("Available");
    const [initialSelected, setInitialSelected] = useState("Available");

    useEffect(() => {
        const saved = localStorage.getItem(`packing-laundry-${tripId}`);

        if (!saved) return;

        setSelected(saved);
        setInitialSelected(saved);
    }, [tripId]);

    const hasChanges = selected !== initialSelected;

    function handleSave() {
        localStorage.setItem(`packing-laundry-${tripId}`, selected);
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
                    Laundry
                </h1>

                <p className="mt-4 text-xl leading-7 text-neutral-500">
                    Will you be able to do laundry during this trip?
                </p>

                <div className="mt-10 overflow-hidden rounded-[2rem] bg-white shadow-[0_14px_40px_rgba(0,0,0,0.08)]">
                    {laundryOptions.map((option, index) => {
                        const active = selected === option.value;
                        const isLast = index === laundryOptions.length - 1;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setSelected(option.value)}
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
                    })}
                </div>
            </div>
        </main>
    );
}