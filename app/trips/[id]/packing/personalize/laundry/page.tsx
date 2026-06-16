"use client";

import BackButton from "@/components/ui/back-button";
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

    function handleSave() {
        if (!hasChanges || successMessage) return;

        localStorage.setItem(`packing-laundry-${tripId}`, selected);

        const laundryMessages: Record<string, string> = {
            Available: "We'll suggest fewer clothing backups because you can wash clothes during the trip.",
            "Hotel service": "We'll keep your list balanced and allow for a short laundry turnaround.",
            "Not available": "We'll suggest enough clothing to cover the full trip without laundry access.",
        };

        setSuccessMessage(laundryMessages[selected] ?? "Laundry preference saved.");

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
                    Laundry
                </h1>

                <p className="mt-4 text-[16px] leading-7 text-black">
                    Will you be able to do laundry during this trip?
                </p>

                <div className="mt-10 overflow-hidden rounded-[1.5rem] bg-white shadow-[0_18px_45px_rgba(70,55,35,0.06)]">
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
                            ? "mt-12 w-full rounded-2xl bg-rose-500 px-5 py-3 text-base font-bold text-white shadow-[0_14px_28px_rgba(70,55,35,0.22)] active:scale-[0.98]"
                            : "mt-12 w-full rounded-2xl bg-neutral-300 px-5 py-3 text-base font-bold text-white shadow-[0_12px_24px_rgba(70,55,35,0.12)]"
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