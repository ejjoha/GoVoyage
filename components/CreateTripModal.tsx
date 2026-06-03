"use client";

import type { FormEvent } from "react";

type CreateTripModalProps = {
    newTitle: string;
    setNewTitle: (value: string) => void;
    newDestination: string;
    setNewDestination: (value: string) => void;
    newStartDate: string;
    setNewStartDate: (value: string) => void;
    newEndDate: string;
    setNewEndDate: (value: string) => void;
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
    newStartDate,
    setNewStartDate,
    newEndDate,
    setNewEndDate,
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
                            Start with the basics. You can invite friends and review currencies next.
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