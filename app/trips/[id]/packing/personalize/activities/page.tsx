"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";

const activityOptions = [
    "Beach",
    "Nightlife",
    "Business meetings",
    "Shopping",
    "Museums",
    "Hiking",
    "Swimming",
    "Fine dining",
    "City walks",
];

export default function ActivitiesPage() {
    const params = useParams<{ id: string }>();
    const tripId = params.id;

    const [selected, setSelected] = useState<string[]>([
        "Beach",
        "Nightlife",
    ]);

    function toggleActivity(activity: string) {
        setSelected((current) =>
            current.includes(activity)
                ? current.filter((item) => item !== activity)
                : [...current, activity]
        );
    }

    return (
        <main className="min-h-screen bg-[#f6f1e8]">
            <div className="mx-auto max-w-md px-5 py-8">
                <Link
                    href={`/trips/${tripId}/packing/personalize`}
                    className="inline-flex items-center text-sm font-bold text-neutral-500"
                >
                    ← Back
                </Link>

                <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-950">
                    Activities
                </h1>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                    Tell us what you&apos;ll be doing on this trip.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                    {activityOptions.map((activity) => {
                        const active = selected.includes(activity);

                        return (
                            <button
                                key={activity}
                                type="button"
                                onClick={() => toggleActivity(activity)}
                                className={
                                    active
                                        ? "rounded-full bg-neutral-950 px-5 py-3 text-base font-bold text-white"
                                        : "rounded-full bg-white px-5 py-3 text-base font-bold text-neutral-600"
                                }
                            >
                                {activity}
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    className="mt-10 w-full rounded-2xl bg-neutral-950 px-5 py-4 text-base font-bold text-white"
                >
                    Save Activities
                </button>
            </div>
        </main>
    );
}