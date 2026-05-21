"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type JournalEntry = {
    id: number;
    title: string;
    body: string;
    mood?: string;
    image?: string;
    visibility?: "private" | "trip";
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
    const [loadingEntries, setLoadingEntries] = useState(true);
    const [tripTitle, setTripTitle] = useState("Trip");
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

    const [entries, setEntries] = useState<JournalEntry[]>([]);

    useEffect(() => {
        async function loadJournalEntries() {
            if (!tripId) return;

            const { data: trip } = await supabase
                .from("trips")
                .select("title")
                .eq("id", tripId)
                .single();

            if (trip?.title) setTripTitle(trip.title);

            setLoadingEntries(true);

            const { data, error } = await supabase
                .from("journal_entries")
                .select("*")
                .eq("trip_id", tripId)
                .order("created_at", { ascending: false });

            if (error) {
                console.error(error);
                setLoadingEntries(false);
                return;
            }

            const formattedEntries: JournalEntry[] =
                data?.map((entry) => ({
                    id: entry.id,
                    title: entry.title,
                    body: entry.body,
                    mood: entry.mood || undefined,
                    image: entry.image_url || undefined,
                    visibility: entry.visibility,
                    createdAt: new Date(entry.created_at).toLocaleString(),
                })) || [];

            setEntries(formattedEntries);

            setLoadingEntries(false);
        }

        loadJournalEntries();
    }, [tripId]);

    async function uploadJournalImage() {
        if (!selectedImageFile) return selectedImage;

        const fileExt = selectedImageFile.name.split(".").pop();
        const fileName = `${tripId}/${Date.now()}.${fileExt}`;

        const { error } = await supabase.storage
            .from("journal-images")
            .upload(fileName, selectedImageFile);

        if (error) {
            console.error(error);
            return selectedImage;
        }

        const { data } = supabase.storage
            .from("journal-images")
            .getPublicUrl(fileName);

        return data.publicUrl;
    }

    async function saveEntry() {
        if (!entryBody.trim()) return;
        const imageUrl = await uploadJournalImage();
        const entryData = {
            trip_id: tripId,
            title: entryTitle || "Untitled memory",
            body: entryBody,
            mood: selectedMood || null,
            image_url: imageUrl,
            visibility: "private",
            updated_at: new Date().toISOString(),
        };

        if (editingEntryId) {
            const { error } = await supabase
                .from("journal_entries")
                .update(entryData)
                .eq("id", editingEntryId);

            if (error) {
                console.error(error);
                return;
            }
        } else {
            const { error } = await supabase
                .from("journal_entries")
                .insert(entryData);

            if (error) {
                console.error(error);
                return;
            }
        }

        setEntryTitle("");
        setEntryBody("");
        setSelectedMood("");
        setSelectedImage(null);
        setSelectedImageFile(null);
        setEditingEntryId(null);
        setShowComposer(false);

        window.location.reload();
    }

    function editEntry(entry: JournalEntry) {
        setEditingEntryId(entry.id);

        setEntryTitle(entry.title);
        setEntryBody(entry.body);
        setSelectedMood(entry.mood || "");
        setSelectedImage(entry.image || null);

        setShowComposer(true);
    }

    async function deleteEntry(entryId: number) {
        const confirmed = window.confirm("Delete this memory?");

        if (!confirmed) return;

        const { error } = await supabase
            .from("journal_entries")
            .delete()
            .eq("id", entryId);

        if (error) {
            console.error(error);
            return;
        }

        setEntries((current) => current.filter((entry) => entry.id !== entryId));
    }

    function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) return;

        const imageUrl = URL.createObjectURL(file);

        setSelectedImage(imageUrl);
        setSelectedImageFile(file);
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
                            {tripTitle} Memories
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
                    {loadingEntries ? (
                        <div className="space-y-5">
                            {[1, 2].map((skeleton) => (
                                <div
                                    key={skeleton}
                                    className="animate-pulse rounded-[2.5rem] border border-[#efe7d8] bg-[#fffdf8] px-6 py-8 shadow-sm"
                                >
                                    <div className="h-4 w-32 rounded-full bg-[#ece5d8]" />
                                    <div className="mt-6 h-10 w-3/4 rounded-full bg-[#ece5d8]" />

                                    <div className="mt-6 space-y-3">
                                        <div className="h-4 rounded-full bg-[#f1ebdf]" />
                                        <div className="h-4 rounded-full bg-[#f1ebdf]" />
                                        <div className="h-4 w-2/3 rounded-full bg-[#f1ebdf]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : entries.length === 0 ? (
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
                                                alt={entry.title}
                                                className="h-50 w-full object-cover"
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
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => deleteEntry(entry.id)}
                                            className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400 transition active:scale-95"
                                        >
                                            Delete
                                        </button>
                                    </div>
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
                    setSelectedImageFile(null);
                    setShowComposer(true);
                }}
                className="fixed bottom-6 right-6 z-40 flex h-14 w-14 touch-manipulation items-center justify-center rounded-full bg-rose-500 text-3xl text-white shadow-xl transition active:scale-95"
            >
                +
            </button>
            {showComposer && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-sm">
                    <button
                        type="button"
                        aria-label="Close composer"
                        className="absolute inset-0"
                        onClick={() => setShowComposer(false)}
                    />

                    <div className="relative mx-auto min-h-full w-full max-w-2xl rounded-t-[2.5rem] bg-[#faf6ee] px-5 pb-8 pt-4 shadow-2xl">

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