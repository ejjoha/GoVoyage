type TripInvite = {
    id: number;
    name: string | null;
    email: string;
    role: string;
    accepted_at: string | null;
    status: string;
};

type InviteFriendsSheetProps = {
    inviteName: string;
    setInviteName: (value: string) => void;
    inviteEmail: string;
    setInviteEmail: (value: string) => void;
    inviteMessage: string;
    tripInvites: TripInvite[];
    onClose: () => void;
    onSendInvite: () => void;
    onDeleteInvite: (inviteId: number) => void;
    onResendInvite: (invite: TripInvite) => void;
};

export default function InviteFriendsSheet({
    inviteName,
    setInviteName,
    inviteEmail,
    setInviteEmail,
    inviteMessage,
    tripInvites,
    onClose,
    onSendInvite,
    onDeleteInvite,
    onResendInvite,
}: InviteFriendsSheetProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pt-12 pb-6 backdrop-blur-[2px] sm:items-center sm:p-6"
            onClick={onClose}
        >
            <div
                className="sheet-up flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-stone-400">
                            Trip setup
                        </p>

                        <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-stone-900">
                            Invite friends
                        </h2>

                        <p className="mt-1 text-sm text-stone-500">
                            Send an email invitation to join this trip.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
                        aria-label="Close invite friends"
                    >
                        ✕
                    </button>
                </div>

                <div className="min-h-0 space-y-4 overflow-y-auto px-5 py-5">
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-stone-700">
                                Traveller name
                            </label>

                            <input
                                type="text"
                                value={inviteName}
                                onChange={(e) => setInviteName(e.target.value)}
                                placeholder="Dad, Anna, friend..."
                                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-stone-700">
                                Email address
                            </label>

                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="friend@example.com"
                                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={onSendInvite}
                            className="w-full rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
                        >
                            Send
                        </button>
                    </div>

                    {inviteMessage && (
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                            {inviteMessage}
                        </div>
                    )}

                    <div className="border-t border-stone-200 pt-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-400">
                            Sent invitations
                        </p>

                        {tripInvites.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-center">
                                <p className="text-sm text-stone-500">
                                    No invitations sent yet.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {tripInvites.map((invite) => (
                                    <div
                                        key={invite.id}
                                        className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-stone-800">
                                                {invite.name || invite.email}
                                            </p>

                                            {invite.name && (
                                                <p className="truncate text-xs text-stone-500">
                                                    {invite.email}
                                                </p>
                                            )}

                                            <p className="mt-0.5 text-xs text-stone-500">
                                                Invitation sent
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 flex-col gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onResendInvite(invite)}
                                                className="rounded-full bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
                                            >
                                                Resend
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onDeleteInvite(invite.id)}
                                                className="rounded-full bg-red-50 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-100"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <p className="text-center text-xs leading-5 text-stone-400">
                        You can invite more people later from the trip settings.
                    </p>
                    <div className="border-t border-stone-200 p-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full rounded-2xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}