import { useState } from "react";
import type { Trip, TripMember } from "../types";
import type { TripInvite } from "../api";
import TripPeopleList from "./TripPeopleList";

type EditTripModalProps = {
    isTripOwner: boolean;
    trip: Trip | null;
    canManageTravellers: boolean;
    canInvitePeople: boolean;
    editTripTitle: string;
    setEditTripTitle: (value: string) => void;

    editTripDestination: string;
    setEditTripDestination: (value: string) => void;

    editTripImageUrl: string;
    setEditTripImageUrl: (value: string) => void;

    editTripStartDate: string;
    setEditTripStartDate: (value: string) => void;

    editTripEndDate: string;
    setEditTripEndDate: (value: string) => void;

    editCurrencies: string[];
    setEditCurrencies: React.Dispatch<React.SetStateAction<string[]>>;

    tripFormError: string;
    travellerFormError: string;

    tripMembers: TripMember[];
    newTravellerName: string;
    setNewTravellerName: (value: string) => void;

    inviteName: string;
    setInviteName: (value: string) => void;
    inviteEmail: string;
    setInviteEmail: (value: string) => void;
    inviteMessage: string;
    tripInvites: TripInvite[];

    onClose: () => void;
    onSaveTrip: (event: React.FormEvent) => void;
    onAddTraveller?: () => void;
    onDeleteTraveller?: (memberId: number) => void;
    onDeleteInvite?: (inviteId: number) => void;
    onResendInvite?: (invite: TripInvite) => void;
    onInviteTraveller?: () => void;
    onDeleteTrip?: () => void;
    onLeaveTrip: () => void;
};

export default function EditTripModal({
    isTripOwner,
    trip,
    canManageTravellers,
    canInvitePeople,
    editTripTitle,
    setEditTripTitle,
    editTripDestination,
    setEditTripDestination,
    editTripImageUrl,
    setEditTripImageUrl,
    editTripStartDate,
    setEditTripStartDate,
    editTripEndDate,
    setEditTripEndDate,
    editCurrencies,
    setEditCurrencies,
    tripFormError,
    travellerFormError,
    tripMembers,
    newTravellerName,
    setNewTravellerName,
    inviteName,
    setInviteName,
    inviteEmail,
    setInviteEmail,
    inviteMessage,
    tripInvites,
    onClose,
    onSaveTrip,
    onAddTraveller,
    onDeleteTraveller,
    onDeleteInvite,
    onResendInvite,
    onInviteTraveller,
    onDeleteTrip,
    onLeaveTrip,

}: EditTripModalProps) {
    const [customCurrency, setCustomCurrency] = useState("");

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pb-3 pt-12 backdrop-blur-[2px] sm:items-center sm:p-6">
            <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
                <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-xl font-semibold tracking-[-0.02em] text-stone-900">
                            Edit trip
                        </h2>
                        <p className="mt-1 text-sm text-stone-500">
                            Update the trip details, dates and travellers.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
                        aria-label="Close edit trip"
                    >
                        ✕
                    </button>
                </div>

                <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
                    <form onSubmit={onSaveTrip} className="space-y-5">

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-stone-700">
                                    Trip title
                                </label>
                                <input
                                    type="text"
                                    value={editTripTitle}
                                    onChange={(e) => setEditTripTitle(e.target.value)}
                                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-stone-700">
                                    Destination
                                </label>
                                <input
                                    type="text"
                                    value={editTripDestination}
                                    onChange={(e) => setEditTripDestination(e.target.value)}
                                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-stone-700">
                                    Image URL
                                </label>
                                <input
                                    type="text"
                                    value={editTripImageUrl}
                                    onChange={(e) => setEditTripImageUrl(e.target.value)}
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
                                        value={editTripStartDate}
                                        onChange={(e) => setEditTripStartDate(e.target.value)}
                                        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-stone-700">
                                        End date
                                    </label>
                                    <input
                                        type="date"
                                        value={editTripEndDate}
                                        onChange={(e) => setEditTripEndDate(e.target.value)}
                                        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4">
                            <div>
                                <h3 className="text-sm font-semibold text-stone-900">
                                    People
                                </h3>
                                <p className="mt-1 text-sm text-stone-500">
                                    Travellers, collaborators, and pending invitations.
                                </p>
                            </div>

                            <div className="mt-4">
                                <TripPeopleList
                                    trip={trip}
                                    tripMembers={tripMembers}
                                    tripInvites={tripInvites}
                                    canManageTravellers={canManageTravellers}
                                    canInvitePeople={canInvitePeople}
                                    newTravellerName={newTravellerName}
                                    setNewTravellerName={setNewTravellerName}
                                    travellerFormError={travellerFormError}
                                    inviteName={inviteName}
                                    setInviteName={setInviteName}
                                    inviteEmail={inviteEmail}
                                    setInviteEmail={setInviteEmail}
                                    inviteMessage={inviteMessage}
                                    onAddTraveller={onAddTraveller}
                                    onInviteTraveller={onInviteTraveller}
                                    onDeleteTraveller={onDeleteTraveller}
                                    onDeleteInvite={onDeleteInvite}
                                    onResendInvite={onResendInvite}
                                />
                            </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                            <div>
                                <h3 className="text-sm font-semibold text-stone-900">
                                    Trip currencies
                                </h3>
                                <p className="mt-1 text-sm text-stone-500">
                                    Choose which currencies are available when adding expenses.
                                </p>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {editCurrencies.map((currency) => (
                                    <button
                                        key={currency}
                                        type="button"
                                        onClick={() =>
                                            setEditCurrencies((current) =>
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
                                        const isSelected = editCurrencies.includes(currency);

                                        return (
                                            <button
                                                key={currency}
                                                type="button"
                                                disabled={isSelected}
                                                onClick={() =>
                                                    setEditCurrencies((current) => [...current, currency])
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

                            <div className="mt-4 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Custom currency"
                                    value={customCurrency}
                                    onChange={(e) =>
                                        setCustomCurrency(e.target.value.toUpperCase())
                                    }
                                    maxLength={3}
                                    className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold uppercase text-stone-800 outline-none transition focus:border-rose-300"
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        const trimmed = customCurrency.trim();

                                        if (
                                            trimmed.length !== 3 ||
                                            editCurrencies.includes(trimmed)
                                        ) {
                                            return;
                                        }

                                        setEditCurrencies((current) => [
                                            ...current,
                                            trimmed,
                                        ]);

                                        setCustomCurrency("");
                                    }}
                                    className="shrink-0 self-start rounded-xl bg-stone-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-black hover:shadow-md active:scale-[0.98] sm:self-auto"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {isTripOwner && (
                            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-4">
                                <h3 className="text-sm font-semibold text-red-700">
                                    Danger zone
                                </h3>
                                <p className="mt-1 text-sm text-red-600/80">
                                    Deleting the trip will remove it permanently.
                                </p>

                                <button
                                    type="button"
                                    onClick={onDeleteTrip}
                                    disabled={!onDeleteTrip}
                                    className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-100"
                                >
                                    Delete trip
                                </button>
                            </div>
                        )}

                        {!isTripOwner && (
                            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-4">
                                <h3 className="text-sm font-semibold text-red-700">
                                    Leave trip
                                </h3>

                                <p className="mt-1 text-sm text-red-600/80">
                                    You will lose access to this trip and its expenses.
                                </p>

                                <button
                                    type="button"
                                    onClick={onLeaveTrip}
                                    className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-100"
                                >
                                    Leave trip
                                </button>
                            </div>
                        )}

                        {tripFormError && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {tripFormError}
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
                                className="rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
                            >
                                Save changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}