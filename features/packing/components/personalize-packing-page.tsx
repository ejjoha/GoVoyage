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
    const [hasKidsList, setHasKidsList] = useState(false);

    useEffect(() => {
        async function load() {
            setLoading(true);

            try {
                const tripData = await getTripForPacking(tripId);
                setTrip(tripData);

                const lists = await getPackingLists(tripId);
                setHasKidsList(
                    lists.some((list) => list.title === "Kids List")
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
            value: hasKidsList ? "Kids List active" : "Create shared kids list",
            href: `/trips/${tripId}/packing/personalize/kids`,
            tone: "bg-yellow-100",
        },
    ];

    return (
        <main className="min-h-screen bg-[#f6f1e8] text-neutral-950">
            <div className="mx-auto min-h-screen max-w-[430px] overflow-hidden px-6 pb-24 pt-12">
                <BackButton href={`/trips/${tripId}/packing`} ariaLabel="Go back" />

                <section className="relative mt-9 min-h-[180px]">
                    <div className="relative z-10 max-w-[210px]">
                        <h1 className="text-[30px] font-extrabold leading-[0.98] tracking-[-0.045em]">
                            Personalize Trip
                        </h1>

                        <p className="mt-5 text-[15px] font-medium leading-[1.55] text-[#747B93]">
                            Help us tailor the perfect packing list for your adventure.
                        </p>
                    </div>

                    <div className="absolute -right-3 -top-8 flex h-[165px] w-[165px] items-center justify-center overflow-hidden rounded-full bg-[#eadfcd] shadow-[inset_0_8px_24px_rgba(80,55,30,0.12)]">
                        <img
                            src="/images/personalize-trip-hero.png"
                            alt="Travel suitcase"
                            className="h-[185px] w-[185px] object-contain"
                        />
                    </div>
                </section>

                <section className="mt-6 rounded-[2rem] bg-white/90 p-5 shadow-[0_18px_45px_rgba(70,55,35,0.06)]">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">✨</span>
                        <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#8C6F45]">
                            Your recommendations are based on
                        </p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                        <div className="flex h-[34px] items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-[13px] font-bold shadow-sm">
                            📍 {loading ? "Loading..." : trip?.destination || "Destination"}
                        </div>

                        <div className="flex h-[34px] items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-[13px] font-bold shadow-sm">
                            🌦 {loading ? "Checking..." : weatherDisplay}
                        </div>

                        <div className="flex h-[34px] items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-[13px] font-bold shadow-sm">
                            📅 {tripDays} {tripDays === 1 ? "Day" : "Days"}
                        </div>
                    </div>
                </section>

                <section className="mt-6 overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_45px_rgba(70,55,35,0.06)]">
                    {rows.map((row, index) => (
                        <Link
                            key={row.title}
                            href={row.href}
                            className="group relative flex min-h-[86px] w-full items-center px-5 text-left transition active:scale-[0.99]"
                        >
                            <div
                                className={`mr-[18px] flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.35rem] ${row.tone}`}
                            >
                                <span className="text-[26px] leading-none">
                                    {row.icon}
                                </span>
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-[18px] font-extrabold tracking-[-0.015em]">
                                    {row.title}
                                </p>

                                <p className="mt-1.5 truncate text-[14px] font-semibold text-[#747B93]">
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

                <section className="mt-6 rounded-[2rem] bg-white/70 p-5 shadow-[0_18px_45px_rgba(70,55,35,0.04)]">
                    <p className="text-sm font-medium leading-6 text-[#747B93]">
                        Changes will update your packing list.
                    </p>
                </section>
            </div>
        </main>
    );
}