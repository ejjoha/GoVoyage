"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getTripForPacking } from "../lib/packing-queries";
import { getTripWeatherSummary, type TripWeatherSummary } from "../lib/weather-intelligence";

type Props = {
    tripId: number;
};

type TripForPacking = Awaited<ReturnType<typeof getTripForPacking>>;

function calculateTripDays(startDate?: string | null, endDate?: string | null) {
    if (!startDate || !endDate) return 1;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const differenceInMs = end.getTime() - start.getTime();
    const days = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24)) + 1;

    return Math.max(days, 1);
}

function getWeatherDisplay(weatherProfiles: string[], weatherLabel?: string | null) {
    if (weatherProfiles.length > 0) return weatherProfiles.join(" + ");
    return weatherLabel ?? "Weather available";
}

export default function PersonalizePackingPage({ tripId }: Props) {
    const [trip, setTrip] = useState<TripForPacking | null>(null);
    const [weatherSummary, setWeatherSummary] = useState<TripWeatherSummary | null>(null);
    const [climate, setClimate] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [laundry, setLaundry] = useState("Not available");
    const [activities, setActivities] = useState<string[]>([]);

    useEffect(() => {
        async function load() {
            setLoading(true);

            try {
                const tripData = await getTripForPacking(tripId);
                setTrip(tripData);

                if (tripData?.destination) {
                    const weather = await getTripWeatherSummary(tripData.destination);
                    setWeatherSummary(weather);
                }
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [tripId]);

    useEffect(() => {
        const saved = localStorage.getItem(`packing-climate-${tripId}`);

        if (!saved) {
            setClimate([]);
            return;
        }

        setClimate(JSON.parse(saved));
    }, [tripId]);

    useEffect(() => {
        const saved = localStorage.getItem(`packing-laundry-${tripId}`);

        if (!saved) return;

        setLaundry(saved);
    }, [tripId]);

    useEffect(() => {
        const saved = localStorage.getItem(
            `packing-activities-${tripId}`
        );

        if (!saved) return;

        setActivities(JSON.parse(saved));
    }, [tripId]);

    useEffect(() => {
        const saved = localStorage.getItem(
            `packing-preference-${tripId}`
        );

        if (!saved) return;

        setPackingPreference(saved);
    }, [tripId]);

    const tripDays = trip ? calculateTripDays(trip.start_date, trip.end_date) : 1;
    const weatherDisplay = getWeatherDisplay(
        weatherSummary?.suggestedProfiles ?? [],
        weatherSummary?.weatherLabel
    );
    const [packingPreference, setPackingPreference] =
        useState("Balanced");
    return (
        <main className="min-h-screen bg-[#f6f1e8]">
            <div className="mx-auto max-w-md px-5 py-8">
                <Link
                    href={`/trips/${tripId}/packing`}
                    className="inline-flex items-center text-sm font-bold text-neutral-500"
                >
                    ← Back
                </Link>

                <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-950">
                    Personalize Trip
                </h1>

                <div className="mt-6 rounded-3xl bg-indigo-50 p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                        Your recommendations are based on
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <div className="rounded-full bg-white px-3 py-2 text-sm font-medium text-indigo-900">
                            📍 {loading ? "Loading..." : trip?.destination || "Destination"}
                        </div>

                        <div className="rounded-full bg-white px-3 py-2 text-sm font-medium text-indigo-900">
                            🌦 {loading ? "Checking weather..." : weatherDisplay}
                        </div>

                        <div className="rounded-full bg-white px-3 py-2 text-sm font-medium text-indigo-900">
                            📅 {tripDays} {tripDays === 1 ? "Day" : "Days"}
                        </div>
                    </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
                    {[
                        [
                            "🏖️",
                            "Activities",
                            activities.join(", ") || "None selected",
                            `/trips/${tripId}/packing/personalize/activities`
                        ],
                        [
                            "🌎",
                            "Climate & Conditions",
                            climate.length > 0 ? climate.join(", ") : "None selected",
                            `/trips/${tripId}/packing/personalize/climate`
                        ],
                        [
                            "🧺",
                            "Laundry",
                            laundry,
                            `/trips/${tripId}/packing/personalize/laundry`
                        ],
                        [
                            "⚖️",
                            "Packing Preference",
                            packingPreference,
                            `/trips/${tripId}/packing/personalize/packing-preference`
                        ],
                        [
                            "🧸",
                            "Traveling with Kids",
                            "Create shared kids list",
                            `/trips/${tripId}/packing/personalize/kids`
                        ],
                    ].map(([icon, title, value, href], index, rows) => {
                        const content = (
                            <>
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-xl">
                                    {icon}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-base font-semibold text-neutral-950">
                                        {title}
                                    </p>

                                    <p className="truncate text-sm text-neutral-500">
                                        {value}
                                    </p>

                                    {index !== rows.length - 1 && (
                                        <div className="mt-4 h-px bg-neutral-100" />
                                    )}
                                </div>

                                <span className="text-xl text-neutral-300">›</span>
                            </>
                        );

                        if (href) {
                            return (
                                <Link
                                    key={title}
                                    href={href}
                                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition active:bg-neutral-50"
                                >
                                    {content}
                                </Link>
                            );
                        }

                        return (
                            <button
                                key={title}
                                type="button"
                                className="flex w-full items-center gap-4 px-5 py-4 text-left transition active:bg-neutral-50"
                            >
                                {content}
                            </button>
                        );
                    })}
                </div>

                <p className="mt-7 text-center text-sm leading-6 text-neutral-500">
                    Changes will update your packing list.
                </p>
            </div>
        </main>
    );
}