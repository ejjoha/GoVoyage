import { useMemo } from "react";
import type { Trip } from "../types";

type UseTripPermissionsArgs = {
    trip: Trip | null;
    currentUserId: string | null;
    currentUserRole: string | null;
};

export function useTripPermissions({
    trip,
    currentUserId,
    currentUserRole,
}: UseTripPermissionsArgs) {
    return useMemo(() => {
        const isTripOwner = Boolean(
            trip && currentUserId && trip.user_id === currentUserId
        );

        const canManageTrip = isTripOwner || currentUserRole === "editor";

        return {
            isTripOwner,
            canManageTrip,
            canInvitePeople: canManageTrip,
            canManageTravellers: canManageTrip,
            canDeleteTrip: isTripOwner,
        };
    }, [trip, currentUserId, currentUserRole]);
}