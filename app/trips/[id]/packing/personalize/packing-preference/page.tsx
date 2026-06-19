"use client";

import PersonalizeHero from "@/features/packing/components/personalize-hero";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";

const options = [
    {
        value: "Light",
        emoji: "🎒",
        description: "Only the essentials",
    },
    {
        value: "Balanced",
        emoji: "⚖️",
        description: "Recommended amount",
    },
    {
        value: "Pack Everything",
        emoji: "🧳",
        description: "Be prepared for everything",
    },
];

export default function PackingPreferencePage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const tripId = params.id;

    const [selected, setSelected] = useState("Balanced");
    const [initialSelected, setInitialSelected] = useState("Balanced");
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem(
            `packing-preference-${tripId}`
        );

        if (!saved) return;

        setSelected(saved);
        setInitialSelected(saved);
    }, [tripId]);

    const hasChanges = selected !== initialSelected;

    async function handleSave() {
        if (!hasChanges || successMessage) return;

        localStorage.setItem(
            `packing-preference-${tripId}`,
            selected
        );

        const preferenceMessages: Record<string, string> = {
            Light: "We'll keep your packing list focused on the essentials.",
            Balanced: "We'll suggest a practical mix of essentials and helpful extras.",
            "Pack Everything": "We'll include more backup items so you're prepared for more situations.",
        };

        setSuccessMessage(preferenceMessages[selected] ?? "Preference saved.");
        setInitialSelected(selected);

        setTimeout(() => {
            router.push(
                `/trips/${tripId}/packing/personalize`
            );
        }, 2500);
    }
    const [isLeaving, setIsLeaving] = useState(false);

    function handleBack(event: MouseEvent<HTMLDivElement>) {
        event.preventDefault();

        if (isLeaving || successMessage) return;

        setIsLeaving(true);

        setTimeout(() => {
            router.push(`/trips/${tripId}/packing/personalize`);
        }, 220);
    }

    return (
        <main
            className={`${isLeaving ? "packing-slide-down-page" : "packing-slide-up-page"
                } min-h-screen bg-[#f6f1e8] text-neutral-950`}
        >
            <div className="mx-auto max-w-md pb-24">
                <div onClickCapture={handleBack}>
                    <PersonalizeHero
                        href={`/trips/${tripId}/packing/personalize`}
                        title="Packing Preference"
                        description="Tell us how much you like to prepare."
                        imageSrc="/images/packing-personalize/packing-preference.png"
                        imageAlt="Packing preference"
                        isLeaving={isLeaving}
                    />
                </div>

                <div className="relative z-20 mx-5 -mt-16 overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_rgba(70,55,35,0.16)]">
                    <div className="px-5 pb-4 pt-6">
                        <h1 className="text-[24px] font-extrabold leading-none tracking-[-0.06em] text-neutral-950 drop-shadow-[0_8px_12px_rgba(70,55,35,0.10)]">
                            Packing Preference
                        </h1>

                        <p className="mt-3 text-[15px] leading-6 text-neutral-500">
                            How much do you like to prepare?
                        </p>
                    </div>

                    <div className="mx-5 h-px bg-black/10" />

                    <div>
                        {options.map((option, index) => {
                            const active = selected === option.value;
                            const isLast = index === options.length - 1;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setSelected(option.value)}
                                    className="relative flex min-h-[72px] w-full items-center bg-white px-5 text-left transition active:bg-neutral-50"
                                >
                                    <div
                                        className="mr-[18px] flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.35rem] bg-neutral-100"
                                    >
                                        <span className="text-[24px] leading-none">
                                            {option.emoji}
                                        </span>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="text-[16px] font-bold tracking-[-0.015em] text-neutral-950 drop-shadow-[0_4px_4px_rgba(70,55,35,0.12)]"
                                        >
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
                    Save Preference
                </button>
                {successMessage && (
                    <>
                        <div className="fixed inset-0 z-[70] bg-black/10 backdrop-blur-[3px]" />

                        <div className="fixed inset-0 z-[80] flex items-center justify-center px-5">
                            <div className="toast-in pointer-events-auto w-full max-w-sm rounded-[2rem] border border-white/70 bg-white/90 px-6 py-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.20)] backdrop-blur-xl">
                                <p className="text-base font-extrabold tracking-[-0.03em] text-neutral-950">
                                    Preference saved
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