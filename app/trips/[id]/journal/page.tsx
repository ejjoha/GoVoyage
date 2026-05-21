"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

type JournalEntry = {
    id: number;
    title: string;
    body: string;
    mood?: string;
    image?: string;
    createdAt: string;
};

export default function TravelJournalPage() {
    const params = useParams();
    const tripId = Number(params.id);

    const [showComposer, setShowComposer] = useState(false);
    const [entryTitle, setEntryTitle] = useState("");
    const [entryBody, setEntryBody] = useState("");
    const [selectedMood, setSelectedMood] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [editingEntryId, setEditingEntryId] = useState<number | null>(null);

    const [entries, setEntries] = useState<JournalEntry[]>([
        {
            id: 1,
            title: "Tiny restaurant in Trastevere",
            body:
                "Found a tiny family-owned restaurant hidden away in a side street. No tourists. Just handwritten menus and incredible pasta.",
            mood: "Beautiful",
            image: "/illustrations/journal-memory.jpg",
            createdAt: "Today · 19:42",
        },
    ]);

    function saveEntry() {
        if (!entryBody.trim()) return;

        if (editingEntryId) {
            setEntries((current) =>
                current.map((entry) =>
                    entry.id === editingEntryId
                        ? {
                            ...entry,
                            title: entryTitle || "Untitled memory",
                            body: entryBody,
                            mood: selectedMood,
                            image: selectedImage || entry.image,
                        }
                        : entry
                )
            );
        } else {
            const newEntry: JournalEntry = {
                id: Date.now(),
                title: entryTitle || "Untitled memory",
                body: entryBody,
                mood: selectedMood,
                image: selectedImage || undefined,
                createdAt: "Just now",
            };

            setEntries((current) => [newEntry, ...current]);
        }

        setEntryTitle("");
        setEntryBody("");
        setSelectedMood("");
        setSelectedImage(null);
        setEditingEntryId(null);

        setShowComposer(false);
    }

    function editEntry(entry: JournalEntry) {
        setEditingEntryId(entry.id);

        setEntryTitle(entry.title);
        setEntryBody(entry.body);
        setSelectedMood(entry.mood || "");
        setSelectedImage(entry.image || null);

        setShowComposer(true);
    }

    function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) return;

        const imageUrl = URL.createObjectURL(file);

        setSelectedImage(imageUrl);
    }
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

                <div className="mb-5 rounded-[2rem] border border-[#efe7d8] px-5 py-4 shadow-sm">
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
                                className="rounded-full bg-[#f6f1e8] px-3.5 py-1.5 text-sm font-medium text-neutral-700 transition active:scale-95"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-5 pb-24">
                    {entries.length === 0 ? (
                        <div className="rounded-[2.5rem] border border-[#efe7d8] bg-[#fffdf8] px-6 py-10 text-center shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                                Your journal is waiting
                            </p>

                            <h2 className="mx-auto mt-3 max-w-sm text-2xl font-bold tracking-tight text-neutral-950">
                                Capture the little moments you’ll want to remember later.
                            </h2>

                            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-500">
                                Start with a meal, a street, a feeling, or something unexpected from your trip.
                            </p>
                        </div>
                    ) : (
                        entries.map((entry) => (
                            <article
                                key={entry.id}
                                className="relative overflow-hidden rounded-[2.5rem] border border-[#efe7d8] bg-[#fffdf8] px-6 py-8 shadow-sm animate-[fadeIn_0.4s_ease]"
                            >
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-[0.18]"
                                    style={{
                                        backgroundImage:
                                            "linear-gradient(to bottom, transparent 31px, #d9d2c3 32px)",
                                        backgroundSize: "100% 32px",
                                    }}
                                />

                                <div className="relative z-10">
                                    {entry.image && (
                                        <div className="mb-6 overflow-hidden rounded-[2rem]">
                                            <img
                                                src={entry.image}
                                                alt=""
                                                className="h-64 w-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                                            Journal Entry
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => editEntry(entry)}
                                            className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 transition active:scale-95"
                                        >
                                            Edit
                                        </button>
                                    </div>

                                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-neutral-950">
                                        {entry.title}
                                    </h2>

                                    <div className="mt-3 flex items-center gap-3 text-sm font-medium text-neutral-400">
                                        <span>{entry.createdAt}</span>

                                        {entry.mood && (
                                            <>
                                                <span>•</span>
                                                <span>{entry.mood}</span>
                                            </>
                                        )}
                                    </div>

                                    <p className="mt-8 leading-8 text-neutral-700">
                                        {entry.body}
                                    </p>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>

            <button
                type="button"
                onClick={() => {
                    setEditingEntryId(null);
                    setEntryTitle("");
                    setEntryBody("");
                    setSelectedMood("");
                    setSelectedImage(null);
                    setShowComposer(true);
                }}
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
                            <div className="mb-3 flex items-center justify-between gap-4">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                                    New Memory
                                </p>

                                <button
                                    type="button"
                                    onClick={() => setShowComposer(false)}
                                    className="text-sm font-semibold text-neutral-400 transition active:scale-95"
                                >
                                    Cancel
                                </button>
                            </div>

                            <h2 className="text-3xl font-bold tracking-tight text-neutral-950">
                                Capture a moment
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-neutral-500">
                                A feeling, discovery, memory or unexpected moment from your journey.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="flex cursor-pointer items-center justify-center rounded-[2rem] border border-dashed border-[#d9cfbe] bg-[#fffdf8] px-5 py-10 text-center transition active:scale-[0.99]">
                                    <div>
                                        <p className="text-sm font-semibold text-neutral-700">
                                            Add a photo
                                        </p>

                                        <p className="mt-1 text-xs text-neutral-400">
                                            Capture the atmosphere of the moment
                                        </p>
                                    </div>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </label>

                                {selectedImage && (
                                    <div className="mt-4 overflow-hidden rounded-[2rem]">
                                        <img
                                            src={selectedImage}
                                            alt=""
                                            className="h-64 w-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
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
                            onClick={saveEntry}
                            className="mt-6 w-full rounded-2xl bg-rose-500 px-5 py-4 text-lg font-bold text-white shadow-sm transition active:scale-[0.98]"
                        >
                            {editingEntryId ? "Update memory" : "Save memory"}
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}