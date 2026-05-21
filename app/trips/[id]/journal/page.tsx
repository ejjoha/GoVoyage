"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function TravelJournalPage() {
    const params = useParams();
    const tripId = Number(params.id);

    const [showComposer, setShowComposer] = useState(false);
    const [entryTitle, setEntryTitle] = useState("");
    const [entryBody, setEntryBody] = useState("");
    const [selectedMood, setSelectedMood] = useState("");

    return (
        <main className="min-h-screen bg-[#f6f1e8] px-4 py-6">
            <div className="mx-auto mb-2 flex max-w-2xl">
                <Link
                    href={`/trips/${tripId}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition active:scale-95"
                    aria-label="Back"
                >
                    <img
                        src="/icons/arrow-left.svg"
                        alt=""
                        className="h-5 w-5 opacity-80"
                    />
                </Link>
            </div>

            <div className="mx-auto max-w-2xl">

                <div className="relative mb-6 overflow-hidden rounded-[2.5rem] bg-[#f5efe4] px-6 py-10 shadow-sm">
                    <img
                        src="/illustrations/journal-hero.png"
                        alt=""
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-55"
                    />

                    <div className="relative z-10">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
                            Travel Journal
                        </p>

                        <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-950 [text-shadow:0_1px_2px_rgba(255,255,255,0.35)]">
                            Italy Memories
                        </h1>

                        <div className="mt-3 truncate text-sm font-medium text-neutral-500 [text-shadow:0_1px_1px_rgba(255,255,255,0.25)]">
                            Day 4 · Rome · Warm evening · 23°
                        </div>
                    </div>
                </div>

                <div className="mb-5 rounded-[2rem] border border-[#efe7d8] px-6 py-6 shadow-sm">
                    <div className="mb-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                            Prompts
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {[
                            "What surprised you today?",
                            "Best meal so far?",
                            "Hidden gem?",
                            "A moment worth remembering?",
                        ].map((prompt) => (
                            <button
                                key={prompt}
                                className="rounded-full bg-[#f6f1e8] px-4 py-2 text-sm font-medium text-neutral-700 transition active:scale-95"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-[2.5rem] bg-[#fffdf8] px-6 py-8 shadow-sm">

                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.22]"
                        style={{
                            backgroundImage:
                                "linear-gradient(to bottom, transparent 31px, #d9d2c3 32px)",
                            backgroundSize: "100% 32px",
                        }}
                    />

                    <div className="relative z-10">

                        <div className="mb-10">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                                Journal Entry
                            </p>

                            <h2 className="mt-3 text-2xl font-bold tracking-tight text-neutral-950">
                                Tiny restaurant in Trastevere
                            </h2>

                            <p className="mt-2 text-sm font-medium text-neutral-400">
                                Today · 19:42
                            </p>

                            <p className="mt-6 leading-8 text-neutral-700">
                                Found a tiny family-owned restaurant hidden away
                                in a side street. No tourists. Just handwritten
                                menus and incredible pasta. One of those moments
                                that feels impossible to plan for.
                            </p>
                        </div>

                        <div className="mb-10">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                                Journal Entry
                            </p>

                            <h2 className="mt-3 text-2xl font-bold tracking-tight text-neutral-950">
                                Rainstorm near the Pantheon
                            </h2>

                            <p className="mt-2 text-sm font-medium text-neutral-400">
                                Yesterday · 16:10
                            </p>

                            <p className="mt-6 leading-8 text-neutral-700">
                                Sudden warm rainstorm. Everyone ran under the
                                arches. Ended up drinking espresso while waiting
                                for it to pass. Somehow became one of the best
                                moments of the trip.
                            </p>
                        </div>

                    </div>
                </div>
            </div>


            <button
                type="button"
                onClick={() => setShowComposer(true)}
                className="fixed bottom-6 right-6 z-40 flex h-14 w-14 touch-manipulation items-center justify-center rounded-full bg-rose-500 text-3xl text-white shadow-xl transition active:scale-95"
            >
                +
            </button>
            {showComposer && (
                <div className="fixed inset-0 z-50 flex items-end bg-black/30 backdrop-blur-sm">
                    <button
                        type="button"
                        aria-label="Close composer"
                        className="absolute inset-0"
                        onClick={() => setShowComposer(false)}
                    />

                    <div className="relative w-full rounded-t-[2.5rem] bg-[#faf6ee] px-5 pb-8 pt-4 shadow-2xl">

                        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-neutral-300" />

                        <div className="mb-6">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                                New Memory
                            </p>

                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950">
                                Capture a moment
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-neutral-500">
                                A feeling, discovery, memory or unexpected moment from your journey.
                            </p>
                        </div>

                        <div className="space-y-4">

                            <input
                                value={entryTitle}
                                onChange={(event) => setEntryTitle(event.target.value)}
                                placeholder="Title (optional)"
                                className="w-full rounded-2xl border border-[#ebe2d3] bg-[#fffdf8] px-4 py-4 text-lg font-semibold text-neutral-900 outline-none placeholder:text-neutral-400"
                            />

                            <textarea
                                value={entryBody}
                                onChange={(event) => setEntryBody(event.target.value)}
                                placeholder="What made this moment memorable?"
                                className="min-h-[220px] w-full resize-none rounded-[2rem] border border-[#ebe2d3] bg-[#fffdf8] px-5 pt-[18px] pb-4 text-[17px] leading-[32px] text-neutral-700 outline-none placeholder:text-neutral-400"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(to bottom, transparent 31px, rgba(217,210,195,0.38) 32px)",
                                    backgroundSize: "100% 32px",
                                    backgroundPositionY: "18px",
                                }}
                            />

                            <div>
                                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                                    Mood
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {[
                                        "Magical",
                                        "Unexpected",
                                        "Favorite",
                                        "Quiet",
                                        "Beautiful",
                                    ].map((mood) => {
                                        const active = selectedMood === mood;

                                        return (
                                            <button
                                                key={mood}
                                                type="button"
                                                onClick={() => setSelectedMood(mood)}
                                                className={
                                                    active
                                                        ? "rounded-full bg-[#e8dcc9] px-4 py-2 text-sm font-semibold text-neutral-800"
                                                        : "rounded-full bg-[#f6f1e8] px-4 py-2 text-sm font-medium text-neutral-500"
                                                }
                                            >
                                                {mood}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="mt-6 w-full rounded-2xl bg-rose-500 px-5 py-4 text-lg font-bold text-white shadow-sm transition active:scale-[0.98]"
                        >
                            Save memory
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}