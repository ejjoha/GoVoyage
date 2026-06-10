"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
        localStorage.setItem(
            `packing-preference-${tripId}`,
            selected
        );

        router.push(
            `/trips/${tripId}/packing/personalize`
        );
    }

    return (
        <main className="min-h-screen bg-[#f6f1e8]">
            <div className="mx-auto max-w-md px-5 py-8">
                {/* Use same layout as Laundry */}
            </div>
        </main>
    );
}