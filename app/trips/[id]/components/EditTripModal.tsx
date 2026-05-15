import type { TripMember } from "../types";

type TripInvite = {
    id: number;
    email: string;
    role: string;
    accepted_at: string | null;
};

type EditTripModalProps = {
    isTripOwner: boolean;

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

    inviteEmail: string;
    setInviteEmail: (value: string) => void;
    inviteMessage: string;
    tripInvites: TripInvite[];

    onClose: () => void;
    onSaveTrip: (event: React.FormEvent) => void;
    onAddTraveller: () => void;
    onDeleteTraveller: (memberId: number) => void;
    onDeleteInvite: (inviteId: number) => void;
    onInviteTraveller: () => void;
    onDeleteTrip: () => void;
};

export default function EditTripModal({
    isTripOwner,
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
    inviteEmail,
    setInviteEmail,
    inviteMessage,
    tripInvites,
    onClose,
    onSaveTrip,
    onAddTraveller,
    onDeleteTraveller,
    onDeleteInvite,
    onInviteTraveller,
    onDeleteTrip,
}: EditTripModalProps) {
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

                        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                            <div>
                                <h3 className="text-sm font-semibold text-stone-900">
                                    Travellers
                                </h3>
                                <p className="mt-1 text-sm text-stone-500">
                                    Add or remove the people on this trip.
                                </p>
                            </div>

                            <div className="mt-4 flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Traveller name"
                                    value={newTravellerName}
                                    onChange={(e) => setNewTravellerName(e.target.value)}
                                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                                />

                                <button
                                    type="button"
                                    onClick={onAddTraveller}
                                    className="shrink-0 rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
                                >
                                    Add
                                </button>
                            </div>

                            {travellerFormError && (
                                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {travellerFormError}
                                </div>
                            )}

                            {tripMembers.length === 0 ? (
                                <p className="mt-3 text-sm text-stone-500">
                                    No travellers added yet.
                                </p>
                            ) : (
                                <div className="mt-4 space-y-2">
                                    {tripMembers.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex min-w-0 items-center justify-between gap-3 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4"
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-stone-700 shadow-sm">
                                                    {member.name
                                                        .split(" ")
                                                        .map((part) => part[0])
                                                        .join("")
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </div>

                                                <span className="min-w-0 truncate text-sm font-medium text-stone-800">
                                                    {member.name}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => onDeleteTraveller(member.id)}
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
                                Invite someone to access and edit this trip.
                            </p>

                            <div className="mt-4 flex gap-2">
                                <input
                                    type="email"
                                    placeholder="friend@example.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                                />

                                <button
                                    type="button"
                                    onClick={onInviteTraveller}
                                    className="rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
                                >
                                    Invite
                                </button>
                            </div>

                            {inviteMessage && (
                                <p className="mt-3 text-sm text-stone-500">
                                    {inviteMessage}
                                </p>
                            )}
                        </div>

                        {tripInvites.length > 0 && (
                            <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4">
                                <h3 className="text-sm font-semibold text-stone-900">
                                    People with access
                                </h3>

                                <div className="mt-3 space-y-2">
                                    {tripInvites.map((invite) => (
                                        <div
                                            key={invite.id}
                                            className="flex items-center justify-between gap-3 rounded-xl bg-stone-50 px-3 py-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-stone-800">
                                                    {invite.email}
                                                </p>
                                                <p className="text-xs text-stone-500">
                                                    {invite.accepted_at ? "Joined" : "Invited"}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                                                    {invite.role}
                                                </span>

                                                {isTripOwner && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onDeleteInvite(invite.id)}
                                                        className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-100"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
                                    className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-100"
                                >
                                    Delete trip
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