import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    getTrip,
    getTripCollaborators,
    getTripInvites,
    type TripInvite,
} from "../api";
import type { Trip, TripCollaborator } from "../types";
import { loadCachedTrip, saveCachedTrip } from "../lib/trip-cache";

export function useTripData(tripId: number) {
    const [trip, setTrip] = useState<Trip | null>(null);
    const [isTripLoading, setIsTripLoading] = useState(true);

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const [currentUserDisplayName, setCurrentUserDisplayName] = useState("");

    const [tripInvites, setTripInvites] = useState<TripInvite[]>([]);
    const [tripCollaborators, setTripCollaborators] = useState<TripCollaborator[]>([]);

    const applyTripToState = useCallback((tripData: Trip) => {
        setTrip(tripData);
    }, []);

    const fetchTrip = useCallback(async () => {
        setIsTripLoading(true);

        const { data, error } = await getTrip(tripId);

        if (error) {
            console.error("Error loading trip:", error);

            const cachedTrip = loadCachedTrip(tripId);

            if (!navigator.onLine && cachedTrip) {
                applyTripToState(cachedTrip);
            } else {
                setTrip(null);
            }

            setIsTripLoading(false);
            return;
        }

        if (!data) {
            const cachedTrip = loadCachedTrip(tripId);

            if (!navigator.onLine && cachedTrip) {
                applyTripToState(cachedTrip);
            } else {
                setTrip(null);
            }

            setIsTripLoading(false);
            return;
        }

        applyTripToState(data);
        saveCachedTrip(tripId, data);

        setIsTripLoading(false);
    }, [applyTripToState, tripId]);

    const fetchTripInvites = useCallback(async () => {
        const { data, error } = await getTripInvites(tripId);

        if (error) {
            console.error("Error loading trip invites:", error);
            setTripInvites([]);
            return;
        }

        setTripInvites(data || []);
    }, [tripId]);

    const fetchTripCollaborators = useCallback(async () => {
        const { data, error } = await getTripCollaborators(tripId);

        if (error) {
            console.error("Error loading trip collaborators:", error);
            setTripCollaborators([]);
            return;
        }

        setTripCollaborators(data || []);
    }, [tripId]);

    const loadCurrentUser = useCallback(async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return null;
        }

        setCurrentUserId(user.id);

        const { data: profileRow } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", user.id)
            .maybeSingle();

        setCurrentUserDisplayName(profileRow?.display_name || user.email || "Someone");

        const { data: collaboratorRow } = await supabase
            .from("trip_collaborators")
            .select("role")
            .eq("trip_id", tripId)
            .eq("user_id", user.id)
            .maybeSingle();

        setCurrentUserRole(collaboratorRow?.role || null);

        return user;
    }, [tripId]);

    return {
        trip,
        setTrip,
        isTripLoading,
        setIsTripLoading,

        currentUserId,
        currentUserRole,
        currentUserDisplayName,

        tripInvites,
        tripCollaborators,

        applyTripToState,
        fetchTrip,
        fetchTripInvites,
        fetchTripCollaborators,
        loadCurrentUser,
    };
}
