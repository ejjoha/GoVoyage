import type { Trip, TripMember, TripCollaborator } from "../types";
import type { TripInvite } from "../api";

type TripPeopleListProps = {
    trip: Trip | null;
    tripMembers: TripMember[];
    tripInvites: TripInvite[];
    tripCollaborators: TripCollaborator[];
    currentUserId?: string | null;
    canTransferOwnership?: boolean;
    canManageTravellers: boolean;
    canInvitePeople: boolean;
    newTravellerName?: string;
    setNewTravellerName?: (value: string) => void;
    travellerFormError?: string;

    inviteName?: string;
    setInviteName?: (value: string) => void;
    inviteEmail?: string;
    setInviteEmail?: (value: string) => void;
    inviteMessage?: string;

    onAddTraveller?: () => void;
    onInviteTraveller?: () => void;
    onDeleteTraveller?: (memberId: number) => void;
    onRemoveCollaborator?: (member: TripMember) => void;
    onLeaveTrip?: () => void;
    onTransferOwnership?: (member: TripMember) => void;
    onDeleteInvite?: (inviteId: number) => void;
    onResendInvite?: (invite: TripInvite) => void;
};

function getInitials(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export default function TripPeopleList({
    trip,
    tripMembers,
    tripInvites,
    tripCollaborators,
    currentUserId,
    canManageTravellers,
    canInvitePeople,
    canTransferOwnership = false,
    newTravellerName,
    setNewTravellerName,
    travellerFormError,
    inviteName,
    setInviteName,
    inviteEmail,
    setInviteEmail,
    inviteMessage,
    onAddTraveller,
    onInviteTraveller,
    onDeleteTraveller,
    onRemoveCollaborator,
    onLeaveTrip,
    onTransferOwnership,
    onDeleteInvite,
    onResendInvite,
}: TripPeopleListProps) {
    const pendingInvites = tripInvites.filter(
        (invite) => invite.status === "pending"
    );

    return (
        <div className="space-y-4">
            {tripMembers.length === 0 && pendingInvites.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center">
                    <p className="text-sm text-stone-500">No travellers added yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {tripMembers.map((member) => {
                        const isOwner = Boolean(trip && member.user_id === trip.user_id);
                        const isCurrentUser = Boolean(
                            currentUserId && member.user_id === currentUserId
                        );
                        const activeCollaborator = Boolean(
                            member.user_id &&
                            tripCollaborators.some(
                                (collaborator) => collaborator.user_id === member.user_id
                            )
                        );

                        return (
                            <div
                                key={`member-${member.id}`}
                                className="flex min-w-0 items-center justify-between gap-3 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4"
                            >
                                <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-stone-700 shadow-sm">
                                        {getInitials(member.name)}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-stone-800">
                                            {member.name}
                                        </p>

                                        {isOwner ? (
                                            <p className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                                                Owner
                                            </p>
                                        ) : activeCollaborator ? (
                                            <p className="mt-1 inline-flex rounded-full bg-stone-200 px-2 py-0.5 text-[11px] font-semibold text-stone-700">
                                                Editor
                                            </p>
                                        ) : (
                                            <p className="mt-1 inline-flex rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-500">
                                                Traveller
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {canManageTravellers && !isOwner && (
                                    <div className="flex shrink-0 flex-col gap-2">
                                        {canTransferOwnership && activeCollaborator && onTransferOwnership && (
                                            <button
                                                type="button"
                                                onClick={() => onTransferOwnership(member)}
                                                className="rounded-full bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
                                            >
                                                Transfer ownership
                                            </button>
                                        )}

                                        {(onDeleteTraveller || onRemoveCollaborator) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (isCurrentUser && activeCollaborator && onLeaveTrip) {
                                                        onLeaveTrip();
                                                        return;
                                                    }

                                                    if (activeCollaborator && member.user_id && onRemoveCollaborator) {
                                                        onRemoveCollaborator(member);
                                                        return;
                                                    }

                                                    onDeleteTraveller?.(member.id);
                                                }}
                                                className="rounded-full bg-red-50 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-100"
                                            >
                                                {isCurrentUser && activeCollaborator
                                                    ? "Leave trip"
                                                    : activeCollaborator
                                                        ? "Remove access"
                                                        : "Remove"}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {pendingInvites.map((invite) => (
                        <div
                            key={`invite-${invite.id}`}
                            className="flex min-w-0 items-center justify-between gap-3 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4"
                        >
                            <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-amber-700 shadow-sm">
                                    @
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-stone-800">
                                        {invite.name || invite.email}
                                    </p>

                                    {invite.name && (
                                        <p className="truncate text-xs text-stone-500">
                                            {invite.email}
                                        </p>
                                    )}

                                    <p className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                                        Pending invite
                                    </p>

                                    {canInvitePeople && onResendInvite && (
                                        <button
                                            type="button"
                                            onClick={() => onResendInvite(invite)}
                                            className="mt-2 block text-xs font-semibold text-amber-700 hover:underline"
                                        >
                                            Resend email
                                        </button>
                                    )}
                                </div>
                            </div>

                            {canInvitePeople && onDeleteInvite && (
                                <button
                                    type="button"
                                    onClick={() => onDeleteInvite(invite.id)}
                                    className="shrink-0 rounded-full bg-red-50 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-100"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {canInvitePeople &&
                inviteName !== undefined &&
                setInviteName &&
                inviteEmail !== undefined &&
                setInviteEmail &&
                onInviteTraveller && (
                    <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                        <h3 className="text-sm font-semibold text-stone-900">
                            Invite traveller
                        </h3>

                        <p className="mt-1 text-sm text-stone-500">
                            Send an email invite to someone who should join this trip.
                        </p>

                        <div className="mt-4 space-y-3">
                            <input
                                type="text"
                                placeholder="Traveller name, e.g. Dad"
                                value={inviteName}
                                onChange={(e) => setInviteName(e.target.value)}
                                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                            />

                            <input
                                type="email"
                                placeholder="friend@example.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                            />

                            <button
                                type="button"
                                onClick={onInviteTraveller}
                                className="w-full rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
                            >
                                Invite
                            </button>
                        </div>

                        {inviteMessage && (
                            <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                                {inviteMessage}
                            </div>
                        )}
                    </div>
                )}

            {canManageTravellers &&
                newTravellerName !== undefined &&
                setNewTravellerName &&
                onAddTraveller && (
                    <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                        <h3 className="text-sm font-semibold text-stone-900">
                            Add traveller without app access
                        </h3>

                        <p className="mt-1 text-sm text-stone-500">
                            Add someone for planning and cost sharing only.
                        </p>

                        <div className="mt-4 flex gap-2">
                            <input
                                type="text"
                                placeholder="Traveller name"
                                value={newTravellerName}
                                onChange={(e) => setNewTravellerName(e.target.value)}
                                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400"
                            />

                            <button
                                type="button"
                                onClick={onAddTraveller}
                                className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
                            >
                                Add
                            </button>
                        </div>

                        {travellerFormError && (
                            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {travellerFormError}
                            </div>
                        )}
                    </div>
                )}
        </div>
    );
}