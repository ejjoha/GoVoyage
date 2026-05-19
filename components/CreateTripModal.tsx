"use client";

import type { FormEvent, SetStateAction } from "react";
type NewTraveller = {
    id: number;
    name: string;
};

type CreateTripModalProps = {
    newTitle: string;
    setNewTitle: (value: string) => void;

    newDestination: string;
    setNewDestination: (value: string) => void;

    newImageUrl: string;
    setNewImageUrl: (value: string) => void;

    newStartDate: string;
    setNewStartDate: (value: string) => void;

    newEndDate: string;
    setNewEndDate: (value: string) => void;

    travellerName: string;
    setTravellerName: (value: string) => void;

    newTravellers: NewTraveller[];
    onAddTraveller: () => void;
    onRemoveTraveller: (travellerId: number) => void;

    inviteEmail: string;
    setInviteEmail: (value: string) => void;

    selectedCurrencies: string[];
    setSelectedCurrencies: (value: SetStateAction<string[]>) => void;

    customCurrency: string;
    setCustomCurrency: (value: string) => void;

    createTripError: string;
    isCreatingTrip: boolean;

    onClose: () => void;
    onCreateTrip: (event: FormEvent) => void;
};

export default function CreateTripModal({
    newTitle,
    setNewTitle,
    newDestination,
    setNewDestination,
    newImageUrl,
    setNewImageUrl,
    newStartDate,
    setNewStartDate,
    newEndDate,
    setNewEndDate,
    travellerName,
    setTravellerName,
    newTravellers,
    onAddTraveller,
    onRemoveTraveller,
    inviteEmail,
    setInviteEmail,
    selectedCurrencies,
    setSelectedCurrencies,
    customCurrency,
    setCustomCurrency,
    createTripError,
    isCreatingTrip,
    onClose,
    onCreateTrip,
}: CreateTripModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pb-3 pt-12 backdrop-blur-[2px] sm:items-center sm:p-6">
            <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
                <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-xl font-semibold tracking-[-0.02em] text-stone-900">
                            Create new trip
                        </h2>
                        <p className="mt-1 text-sm text-stone-500">
                            Start with the basics and build the details from there.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
                        aria-label="Close create trip"
                    >
                        ✕
                    </button>
                </div>

                <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
                    <form onSubmit={onCreateTrip} className="space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-stone-700">
                                    Trip title
                                </label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-stone-700">
                                    Destination
                                </label>
                                <input
                                    type="text"
                                    value={newDestination}
                                    onChange={(e) => setNewDestination(e.target.value)}
                                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-stone-700">
                                    Image URL
                                </label>
                                <input
                                    type="text"
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-stone-700">
                                        Start date
                                    </label>
                                    <input
                                        type="date"
                                        value={newStartDate}
                                        onChange={(e) => setNewStartDate(e.target.value)}
                                        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-stone-700">
                                        End date
                                    </label>
                                    <input
                                        type="date"
                                        value={newEndDate}
                                        onChange={(e) => setNewEndDate(e.target.value)}
                                        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                            <h3 className="text-sm font-semibold text-stone-900">
                                Travellers
                            </h3>
                            <p className="mt-1 text-sm text-stone-500">
                                Add the people going on this trip.
                            </p>

                            <div className="mt-4 flex w-full min-w-0 gap-3">
                                <input
                                    type="text"
                                    placeholder="Traveller name"
                                    value={travellerName}
                                    onChange={(e) => setTravellerName(e.target.value)}
                                    className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                                />

                                <button
                                    type="button"
                                    onClick={onAddTraveller}
                                    className="shrink-0 self-start rounded-xl bg-stone-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-black hover:shadow-md active:scale-[0.98] sm:self-auto"
                                >
                                    Add
                                </button>
                            </div>

                            {newTravellers.length === 0 ? (
                                <p className="mt-3 text-sm text-stone-500">
                                    No travellers added yet.
                                </p>
                            ) : (
                                <div className="mt-4 space-y-2">
                                    {newTravellers.map((traveller) => (
                                        <div
                                            key={traveller.id}
                                            className="flex min-w-0 items-center justify-between gap-3 overflow-hidden rounded-2xl border border-stone-200 bg-white px-4 py-4"
                                        >
                                            <span className="min-w-0 truncate text-sm font-medium text-stone-800">
                                                {traveller.name}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => onRemoveTraveller(traveller.id)}
                                                className="shrink-0 rounded-full bg-red-50 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-100"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                            <h3 className="text-sm font-semibold text-stone-900">
                                Invite by email
                            </h3>
                            <p className="mt-1 text-sm text-stone-500">
                                Optionally invite someone to access and edit this trip.
                            </p>

                            <div className="mt-4 flex w-full min-w-0 gap-2">
                                <input
                                    type="email"
                                    placeholder="friend@example.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                                />

                                <button
                                    type="button"
                                    className="shrink-0 self-start rounded-xl bg-stone-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-black hover:shadow-md active:scale-[0.98] sm:self-auto"
                                >
                                    Invite
                                </button>
                            </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                            <h3 className="text-sm font-semibold text-stone-900">
                                Trip currencies
                            </h3>
                            <p className="mt-1 text-sm text-stone-500">
                                Choose which currencies are available when adding expenses.
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {selectedCurrencies.map((currency) => (
                                    <button
                                        key={currency}
                                        type="button"
                                        onClick={() =>
                                            setSelectedCurrencies((current) =>
                                                current.filter((item) => item !== currency)
                                            )
                                        }
                                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm"
                                    >
                                        {currency} ×
                                    </button>
                                ))}
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2">
                                {["NOK", "SEK", "DKK", "EUR", "USD", "GBP", "THB", "IDR", "JPY"].map(
                                    (currency) => {
                                        const isSelected = selectedCurrencies.includes(currency);

                                        return (
                                            <button
                                                key={currency}
                                                type="button"
                                                disabled={isSelected}
                                                onClick={() =>
                                                    setSelectedCurrencies((current) => [...current, currency])
                                                }
                                                className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${isSelected
                                                    ? "bg-stone-200 text-stone-400"
                                                    : "bg-white text-stone-800 shadow-sm hover:bg-stone-100"
                                                    }`}
                                            >
                                                {currency}
                                            </button>
                                        );
                                    }
                                )}
                            </div>

                            <div className="mt-4 flex w-full min-w-0 gap-2">
                                <input
                                    type="text"
                                    placeholder="Custom currency"
                                    value={customCurrency}
                                    onChange={(e) => setCustomCurrency(e.target.value.toUpperCase())}
                                    maxLength={3}
                                    className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold uppercase text-stone-800 outline-none transition focus:border-rose-300"
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        const trimmed = customCurrency.trim();

                                        if (
                                            trimmed.length !== 3 ||
                                            selectedCurrencies.includes(trimmed)
                                        ) {
                                            return;
                                        }

                                        setSelectedCurrencies((current) => [...current, trimmed]);
                                        setCustomCurrency("");
                                    }}
                                    className="shrink-0 self-start rounded-xl bg-stone-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-black hover:shadow-md active:scale-[0.98] sm:self-auto"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {createTripError && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {createTripError}
                            </div>
                        )}

                        <div className="flex flex-col-reverse gap-3 border-t border-stone-200 pt-4 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl bg-stone-100 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-200"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isCreatingTrip}
                                className="rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-stone-300"
                            >
                                {isCreatingTrip ? "Creating trip..." : "Create trip"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}