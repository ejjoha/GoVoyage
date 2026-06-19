"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    getPackingLists,
    getTripForPacking,
} from "../lib/packing-queries";
import {
    getTripWeatherSummary,
    type TripWeatherSummary,
} from "../lib/weather-intelligence";
import BackButton from "@/components/ui/back-button";

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

function getWeatherDisplay(
    weatherProfiles: string[],
    weatherLabel?: string | null
) {
    if (weatherProfiles.length > 0) return weatherProfiles.join(" + ");
    return weatherLabel ?? "Weather available";
}

export default function PersonalizePackingPage({ tripId }: Props) {
    const [trip, setTrip] = useState<TripForPacking | null>(null);
    const [weatherSummary, setWeatherSummary] =
        useState<TripWeatherSummary | null>(null);
    const [climate, setClimate] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [laundry, setLaundry] = useState("Not available");
    const [activities, setActivities] = useState<string[]>([]);
    const [packingPreference, setPackingPreference] = useState("Balanced");
    const [kidsListNames, setKidsListNames] = useState<string[]>([]);

    useEffect(() => {
        async function load() {
            setLoading(true);

            try {
                const tripData = await getTripForPacking(tripId);
                setTrip(tripData);

                const lists = await getPackingLists(tripId);
                setKidsListNames(
                    lists
                        .filter((list) => list.type === "shared" && list.emoji === "🧸")
                        .map((list) => list.title)
                );

                if (tripData?.destination) {
                    const weather = await getTripWeatherSummary(
                        tripData.destination
                    );
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
        setClimate(saved ? JSON.parse(saved) : []);
    }, [tripId]);

    useEffect(() => {
        const saved = localStorage.getItem(`packing-laundry-${tripId}`);
        if (saved) setLaundry(saved);
    }, [tripId]);

    useEffect(() => {
        const saved = localStorage.getItem(`packing-activities-${tripId}`);
        if (saved) setActivities(JSON.parse(saved));
    }, [tripId]);

    useEffect(() => {
        const saved = localStorage.getItem(`packing-preference-${tripId}`);
        if (saved) setPackingPreference(saved);
    }, [tripId]);

    const tripDays = trip
        ? calculateTripDays(trip.start_date, trip.end_date)
        : 1;

    const weatherDisplay = getWeatherDisplay(
        weatherSummary?.suggestedProfiles ?? [],
        weatherSummary?.weatherLabel
    );

    const rows = [
        {
            icon: "🏖️",
            title: "Activities",
            value: activities.join(", ") || "None selected",
            href: `/trips/${tripId}/packing/personalize/activities`,
            tone: "bg-violet-100",
        },
        {
            icon: "🌍",
            title: "Climate & Conditions",
            value: climate.length > 0 ? climate.join(", ") : "None selected",
            href: `/trips/${tripId}/packing/personalize/climate`,
            tone: "bg-emerald-100",
        },
        {
            icon: "🧺",
            title: "Laundry",
            value: laundry,
            href: `/trips/${tripId}/packing/personalize/laundry`,
            tone: "bg-orange-100",
        },
        {
            icon: "⚖️",
            title: "Packing Preference",
            value: packingPreference,
            href: `/trips/${tripId}/packing/personalize/packing-preference`,
            tone: "bg-sky-100",
        },
        {
            icon: "🧸",
            title: "Traveling with Kids",
            value:
                kidsListNames.length > 0
                    ? kidsListNames.join(", ")
                    : "Create a separate Kid's List",
            href: `/trips/${tripId}/packing/personalize/kids`,
            tone: "bg-yellow-100",
        },
    ];

    return (
        <main className="packing-slide-in-page min-h-screen bg-[#f6f1e8] text-neutral-950">
            <div className="mx-auto min-h-screen max-w-xl overflow-hidden pb-24">

                <section className="relative mb-24">
                    <div className="relative overflow-hidden rounded-b-[2.75rem] bg-neutral-200">
                        {trip?.image_url ? (
                            <img
                                src="/images/packing-personalize/personalize.png"
                                alt={trip.title ?? "Trip"}
                                className="h-[18rem] w-full object-cover"
                            />
                        ) : (
                            <div className="h-[18rem] w-full bg-gradient-to-br from-neutral-200 to-neutral-300" />
                        )}

                        <div className="absolute left-4 top-4 z-30">
                            <BackButton
                                href={`/trips/${tripId}/packing`}
                                ariaLabel="Go back"
                            />
                        </div>
                    </div>

                    <div className="absolute inset-x-0 -bottom-16 z-20 mx-6 rounded-[1.25rem] bg-white p-5 shadow-[0_18px_45px_rgba(70,55,35,0.10)]">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">✨</span>

                            <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#8C6F45] drop-shadow-[0_3px_6px_rgba(70,55,35,0.08)]">
                                These are your current stats
                            </p>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                            <div className="flex h-[24px] items-center gap-1 rounded-full border border-black/10 bg-white px-2 text-[13px] font-bold shadow-sm">
                                📍 {loading ? "Loading..." : trip?.destination || "Destination"}
                            </div>

                            <div className="flex h-[24px] items-center gap-1 rounded-full border border-black/10 bg-white px-2 text-[13px] font-bold shadow-sm">
                                🌦 {loading ? "Checking..." : weatherDisplay}
                            </div>

                            <div className="flex h-[24px] items-center gap-1 rounded-full border border-black/10 bg-white px-2 text-[13px] font-bold shadow-sm">
                                📅 {tripDays} {tripDays === 1 ? "Day" : "Days"}
                            </div>
                        </div>
                    </div>
                </section>

                <p className="mx-8 max-w-[17rem] text-[12px] font-extrabold uppercase leading-5 tracking-[0.12em] text-[#8C6F45] drop-shadow-[0_2px_14px_rgba(70,55,35,0.40)]">
                    Choose your trip profile for your tailored packing list
                </p>

                <section className="mx-6 mt-6 overflow-hidden rounded-[1.5rem] bg-white shadow-[0_18px_45px_rgba(70,55,35,0.06)]">
                    {rows.map((row, index) => (
                        <Link
                            key={row.title}
                            href={row.href}
                            className="group relative flex min-h-[72px] w-full items-center px-5 text-left transition active:scale-[0.99]"
                        >
                            <div
                                className={`mr-[18px] flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.35rem] ${row.tone}`}
                            >
                                <span className="text-[24px] leading-none">
                                    {row.icon}
                                </span>
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-[16px] font-bold tracking-[-0.015em] text-neutral-950 drop-shadow-[0_4px_4px_rgba(70,55,35,0.12)]">
                                    {row.title}
                                </p>

                                <p className="mt-1.5 truncate text-[13px] font-normal text-black">
                                    {row.value}
                                </p>
                            </div>

                            <span className="ml-3 text-2xl text-[#4D5369] transition group-hover:translate-x-0.5">
                                ›
                            </span>

                            {index !== rows.length - 1 && (
                                <div className="absolute bottom-0 left-5 right-5 h-px bg-black/10" />
                            )}
                        </Link>
                    ))}
                </section>
            </div>
        </main>
    );
}