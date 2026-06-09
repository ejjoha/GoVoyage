"use client";

import { createKey, type PackingItem } from "./packingSuggestions";
import { usePackingList } from "./hooks/usePackingList";
import { usePackingProfiles } from "./hooks/usePackingProfiles";
import PackProfileCard from "./components/PackProfileCard";
import PackCategoryCard from "./components/PackCategoryCard";
import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import {
    climateOptions,
    environmentOptions,
    tripStyleOptions,
    ClimateOption,
    EnvironmentOption,
} from "./tripProfiles";
import ScrollToTopButton from "../components/ScrollToTopButton";

export default function PackListPage() {
    const params = useParams();
    const tripId = Number(params.id);
    const [profileOpen, setProfileOpen] = useState(false);
    const {
        profiles,
        activeProfileId,
        setActiveProfileId,
        loaded: profilesLoaded,
    } = usePackingProfiles(tripId);
    const {
        items,
        setItems,

        packingListId,
        packingProfileId,
        packingProfileName,
        packingProfileType,

        selectedClimates,
        setSelectedClimates,
        selectedEnvironments,
        setSelectedEnvironments,
        selectedTripStyles,
        setSelectedTripStyles,

        loaded,
        hydrated,
        setHydrated,

        deletedItem,
        deleteSuccess,
        packedCount,
        totalCount,
        progress,
        groupedItems,

        tripTitle,
        tripDestination,
        tripDays,
        tripImageUrl,
        weatherSummary,

        toggleItem,
        decreaseQuantity,
        increaseQuantity,
        deleteItem,
        undoDeleteItem,
    } = usePackingList(tripId, activeProfileId);

    const [newItemName, setNewItemName] = useState("");
    const [showAddItem, setShowAddItem] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    const [itemPendingDelete, setItemPendingDelete] = useState<PackingItem | null>(null);

    const tripNights = Math.max(tripDays - 1, 0);

    function resetPackList() {
        setSelectedClimates([]);
        setSelectedEnvironments([]);
        setSelectedTripStyles([]);
        setItems([]);
        setHydrated(false);

        setResetSuccess(true);

        setTimeout(() => {
            setHydrated(true);
        }, 0);

        setTimeout(() => {
            setResetSuccess(false);
        }, 2200);
    }

    function toggleCategory(category: string) {
        setOpenCategories((current) => ({
            ...current,
            [category]: !(current[category] ?? true),
        }));
    }

    function toggleClimate(climate: ClimateOption) {
        setSelectedClimates((current) =>
            current.includes(climate)
                ? current.filter((item) => item !== climate)
                : [...current, climate]
        );
    }

    function toggleEnvironment(environment: EnvironmentOption) {
        setSelectedEnvironments((current) =>
            current.includes(environment)
                ? current.filter((item) => item !== environment)
                : [...current, environment]
        );
    }

    async function addCustomItem() {
        const trimmedName = newItemName.trim();
        if (!trimmedName) return;

        const newKey = createKey("Custom", trimmedName);

        const alreadyExists = items.some((item) => item.key === newKey);
        if (alreadyExists) return;

        setItems((currentItems) => [
            ...currentItems,
            {
                key: newKey,
                name: trimmedName,
                category: "Custom",
                packed: false,
                quantity: 1,
                source: "custom",
            },
        ]);

        setNewItemName("");
        setShowAddItem(false);
    }

    return (
        <main className="min-h-screen bg-[#f6f1e8] px-4 py-6">
            <div className="mx-auto mb-1 flex max-w-2xl">
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

                {!loaded && (
                    <div className="space-y-3 animate-pulse">
                        <div className="mb-5">
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="mt-4 h-8 w-56 rounded-full bg-white/70" />
                                    <div className="mt-3 h-4 w-28 rounded-full bg-white/60" />
                                </div>

                                <div className="mt-4 h-14 w-14 rounded-full bg-white/80 shadow-sm" />
                            </div>

                            <div className="h-48 rounded-[2rem] bg-white/70 shadow-[0_18px_50px_rgba(0,0,0,0.10)]" />
                        </div>

                        <div className="rounded-3xl bg-white/70 px-5 py-4 shadow-sm">
                            <div className="h-6 w-32 rounded-full bg-neutral-200/70" />
                            <div className="mt-2 h-4 w-44 rounded-full bg-neutral-100" />
                        </div>

                        <div className="rounded-3xl bg-white/70 px-5 py-4 shadow-sm">
                            <div className="h-6 w-36 rounded-full bg-neutral-200/70" />
                            <div className="mt-2 h-4 w-20 rounded-full bg-neutral-100" />

                            <div className="mt-3 divide-y divide-neutral-100 border-t border-neutral-100">
                                <div className="flex items-center gap-4 py-3">
                                    <div className="h-5 w-5 rounded-md bg-neutral-200" />
                                    <div className="h-4 flex-1 rounded-full bg-neutral-100" />
                                    <div className="h-6 w-20 rounded-full bg-neutral-100" />
                                </div>

                                <div className="flex items-center gap-4 py-3">
                                    <div className="h-5 w-5 rounded-md bg-neutral-200" />
                                    <div className="h-4 flex-1 rounded-full bg-neutral-100" />
                                    <div className="h-6 w-20 rounded-full bg-neutral-100" />
                                </div>

                                <div className="flex items-center gap-4 py-3">
                                    <div className="h-5 w-5 rounded-md bg-neutral-200" />
                                    <div className="h-4 flex-1 rounded-full bg-neutral-100" />
                                    <div className="h-6 w-20 rounded-full bg-neutral-100" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {loaded && (
                    <>
                        <div className="mb-5">
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="mt-4 text-2xl font-bold tracking-tight text-neutral-950">
                                        {tripDestination || tripTitle} Packing List
                                    </h1>

                                    <p className="mt-3 text-sm font-medium text-neutral-500">
                                        {tripDays} {tripDays === 1 ? "day" : "days"} · {tripNights}{" "}
                                        {tripNights === 1 ? "night" : "nights"}
                                    </p>
                                </div>

                                <div className="mt-4 flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-white shadow-sm">
                                    <span className="text-sm font-semibold text-rose-600">{progress}%</span>
                                    <span className="text-[11px] font-semibold text-neutral-500">
                                        {packedCount}/{totalCount}
                                    </span>
                                </div>
                            </div>

                            <div className="relative overflow-hidden rounded-[2rem] bg-neutral-200 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                                {tripImageUrl ? (
                                    <img
                                        src={tripImageUrl}
                                        alt={tripTitle}
                                        className="h-48 w-full object-cover"
                                    />
                                ) : (
                                    <img
                                        src="/illustrations/pack-list-hero.png"
                                        alt=""
                                        className="h-48 w-full object-cover"
                                    />
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                                {weatherSummary && (
                                    <div className="absolute bottom-5 left-5 text-white">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-bold">
                                                {weatherSummary.temperature !== null
                                                    ? `${Math.round(weatherSummary.temperature)}°`
                                                    : "—"}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs font-semibold">
                                            {weatherSummary.weatherLabel}
                                        </p>

                                        {weatherSummary.precipitationProbability !== null && (
                                            <p className="mt-2 text-sm">
                                                {weatherSummary.precipitationProbability}% rain chance
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <PackProfileCard
                            name={packingProfileName}
                            type={packingProfileType}
                        />
                        {profilesLoaded && profiles.length > 1 && (
                            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                                {profiles.map((profile) => {
                                    const active = profile.id === activeProfileId;

                                    return (
                                        <button
                                            key={profile.id}
                                            type="button"
                                            onClick={() => setActiveProfileId(profile.id)}
                                            className={
                                                active
                                                    ? "shrink-0 rounded-full bg-rose-500 px-4 py-2 text-sm font-bold text-white"
                                                    : "shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm"
                                            }
                                        >
                                            {profile.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mb-2 rounded-3xl bg-white px-5 py-4 shadow-sm">
                            <button
                                type="button"
                                onClick={() => setProfileOpen((open) => !open)}
                                className="flex w-full items-center justify-between gap-4 text-left"
                            >
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-950">Trip profile</h2>
                                    <p className="mt-1 text-sm text-neutral-500">
                                        {[...selectedClimates, ...selectedEnvironments].length > 0
                                            ? [...selectedClimates, ...selectedEnvironments].join(" · ")
                                            : "Choose climate and trip style"}
                                    </p>
                                </div>

                                <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-semibold text-neutral-700">
                                    {profileOpen ? "Done" : "Edit"}
                                </span>
                            </button>

                            {profileOpen && (
                                <div className="mt-5">
                                    {weatherSummary && weatherSummary.suggestedProfiles.length > 0 && (
                                        <div className="mb-5 rounded-2xl bg-rose-50 p-4">
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
                                                Suggested by weather
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {weatherSummary.suggestedProfiles.map((profile) => (
                                                    <span
                                                        key={profile}
                                                        className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-rose-500 shadow-sm"
                                                    >
                                                        {profile}
                                                    </span>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedClimates((current) => [
                                                        ...new Set([...current, ...weatherSummary.suggestedProfiles]),
                                                    ]);
                                                }}
                                                className="mt-3 w-full rounded-2xl bg-rose-500 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98]"
                                            >
                                                Apply weather suggestions
                                            </button>
                                        </div>
                                    )}

                                    <h3 className="mb-3 text-sm font-bold text-neutral-950">
                                        Climate
                                    </h3>

                                    <div className="flex flex-wrap gap-2">
                                        {climateOptions.map((climate) => {
                                            const active = selectedClimates.includes(climate);

                                            return (
                                                <button
                                                    key={climate}
                                                    type="button"
                                                    onClick={() => toggleClimate(climate)}
                                                    className={
                                                        active
                                                            ? "rounded-full bg-rose-500 px-3.5 py-1.5 text-sm font-semibold text-white"
                                                            : "rounded-full bg-neutral-100 px-3.5 py-1.5 text-sm font-medium text-neutral-700"
                                                    }
                                                >
                                                    {climate}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <h3 className="mb-3 mt-5 text-sm font-bold text-neutral-950">
                                        Environment
                                    </h3>

                                    <div className="flex flex-wrap gap-2">
                                        {environmentOptions.map((environment) => {
                                            const active = selectedEnvironments.includes(environment);

                                            return (
                                                <button
                                                    key={environment}
                                                    type="button"
                                                    onClick={() => toggleEnvironment(environment)}
                                                    className={
                                                        active
                                                            ? "rounded-full bg-rose-500 px-3.5 py-1.5 text-sm font-semibold text-white"
                                                            : "rounded-full bg-neutral-100 px-3.5 py-1.5 text-sm font-medium text-neutral-700"
                                                    }
                                                >
                                                    {environment}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <h3 className="mb-3 mt-5 text-sm font-bold text-neutral-950">
                                        Trip style
                                    </h3>

                                    <div className="flex flex-wrap gap-2">
                                        {tripStyleOptions.map((style) => {
                                            const active = selectedTripStyles.includes(style);

                                            return (
                                                <button
                                                    key={style}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedTripStyles((current) =>
                                                            current.includes(style)
                                                                ? current.filter((item) => item !== style)
                                                                : [...current, style]
                                                        );
                                                    }}
                                                    className={
                                                        active
                                                            ? "rounded-full bg-rose-500 px-3.5 py-1.5 text-sm font-semibold text-white"
                                                            : "rounded-full bg-neutral-100 px-3.5 py-1.5 text-sm font-medium text-neutral-700"
                                                    }
                                                >
                                                    {style}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={resetPackList}
                                        className="mt-10 w-full rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-bold text-neutral-700 transition active:scale-[0.98]"
                                    >
                                        Reset pack list
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 pb-24">
                            {Object.entries(groupedItems).map(([category, categoryItems]) => (
                                <PackCategoryCard
                                    key={category}
                                    category={category}
                                    items={categoryItems}
                                    isOpen={openCategories[category] ?? true}
                                    onToggleCategory={toggleCategory}
                                    onToggleItem={toggleItem}
                                    onDeleteItem={deleteItem}
                                    onRequestDelete={setItemPendingDelete}
                                    onDecreaseQuantity={(item) => decreaseQuantity(item.key)}
                                    onIncreaseQuantity={(item) => increaseQuantity(item.key)}
                                />
                            ))}
                        </div>

                        {itemPendingDelete && (
                            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-6">
                                <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 text-center shadow-2xl">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-2xl">
                                        🧳
                                    </div>

                                    <h2 className="text-xl font-bold text-neutral-950">
                                        Remove item?
                                    </h2>

                                    <p className="mt-2 text-sm text-neutral-500">
                                        Remove “{itemPendingDelete.name}” from your pack list?
                                    </p>

                                    <div className="mt-6">
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setItemPendingDelete(null)}
                                                className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-bold text-neutral-700"
                                            >
                                                Keep it
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    deleteItem(itemPendingDelete.key, { showUndo: false });
                                                    setItemPendingDelete(null);
                                                }}
                                                className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-bold text-white"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {deleteSuccess && deletedItem && (
                            <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 pointer-events-none">
                                <div className="toast-in pointer-events-auto flex w-full max-w-sm items-center gap-4 rounded-[1.75rem] border border-white/70 bg-white/95 px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-xl">
                                        🧳
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-neutral-950">
                                            Removed “{deletedItem.name}”
                                        </p>

                                        <p className="mt-0.5 text-xs font-medium text-neutral-500">
                                            Item removed from this trip.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={undoDeleteItem}
                                        className="shrink-0 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-rose-500 transition active:scale-95"
                                    >
                                        Undo
                                    </button>
                                </div>
                            </div>
                        )}

                        {resetSuccess && (
                            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/10 px-6 pointer-events-none">
                                <div className="toast-in pointer-events-auto w-full max-w-sm rounded-[2rem] border border-white/70 bg-white/90 px-6 py-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.20)] backdrop-blur-xl">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-2xl shadow-sm">
                                        ✓
                                    </div>

                                    <p className="text-lg font-semibold tracking-[-0.02em] text-stone-900">
                                        Pack list reset
                                    </p>

                                    <p className="mt-1 text-sm text-stone-500">
                                        Your smart suggestions have been refreshed.
                                    </p>
                                </div>
                            </div>
                        )}

                        {showAddItem && (
                            <div className="fixed inset-0 z-50 flex items-end bg-black/40">
                                <button
                                    type="button"
                                    aria-label="Close add item"
                                    className="absolute inset-0"
                                    onClick={() => setShowAddItem(false)}
                                />

                                <div className="relative w-full rounded-t-3xl bg-white px-5 py-5 shadow-2xl">
                                    <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-neutral-300" />

                                    <h2 className="text-2xl font-bold text-neutral-950">Add packing item</h2>

                                    <input
                                        value={newItemName}
                                        onChange={(event) => setNewItemName(event.target.value)}
                                        placeholder="Example: GoPro battery"
                                        className="mt-5 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-base outline-none"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={addCustomItem}
                                        className="mt-4 w-full rounded-2xl bg-rose-500 px-5 py-4 font-bold text-white shadow-sm transition active:scale-[0.98]"
                                    >
                                        Add item
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setShowAddItem(true)}
                            className="fixed bottom-6 right-6 flex h-13 w-13 items-center justify-center rounded-full bg-rose-500 text-3xl text-white shadow-xl transition active:scale-95"
                        >
                            +
                        </button>
                    </>
                )}
            </div>
            <ScrollToTopButton />
        </main>
    );
}