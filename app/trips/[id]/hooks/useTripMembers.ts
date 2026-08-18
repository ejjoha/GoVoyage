import { useRef, useState } from "react";
import {
    createTripMember,
    deleteTripMember,
    getTripMembers,
} from "../api";
import type { TripMember } from "../types";

export function useTripMembers(tripId: number) {
    const [tripMembers, setTripMembers] = useState<TripMember[]>([]);
    const [newTravellerName, setNewTravellerName] = useState("");
    const [travellerFormError, setTravellerFormError] = useState("");
    const [isAddingTraveller, setIsAddingTraveller] = useState(false);
    const addTravellerLockRef = useRef(false);

    async function fetchTripMembers() {
        const { data, error } = await getTripMembers(tripId);

        if (error) {
            console.error("Error loading trip members:", error);
            setTripMembers([]);
            return;
        }

        setTripMembers(data || []);
    }

    async function addTraveller() {
        if (addTravellerLockRef.current) {
            return;
        }

        const trimmedName = newTravellerName.trim();
        setTravellerFormError("");

        if (!trimmedName) {
            setTravellerFormError("Please enter a traveller name.");
            return;
        }

        // UX nicety only, not the real duplicate-submission protection - see
        // the ref lock above. Two genuinely different travellers can share a
        // name, so this check is a helpful early hint, not a guarantee.
        const alreadyExists = tripMembers.some(
            (member) =>
                member.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );

        if (alreadyExists) {
            setTravellerFormError("That traveller is already on this trip.");
            return;
        }

        addTravellerLockRef.current = true;
        setIsAddingTraveller(true);

        try {
            const { error } = await createTripMember(tripId, trimmedName);

            if (error) {
                console.error("Error adding traveller:", error);
                setTravellerFormError("We couldn’t add that traveller. Please try again.");
                return;
            }

            setNewTravellerName("");
            setTravellerFormError("");
            await fetchTripMembers();
        } finally {
            addTravellerLockRef.current = false;
            setIsAddingTraveller(false);
        }
    }

    async function deleteTraveller(memberId: number) {
        const { error } = await deleteTripMember(memberId);

        if (error) {
            console.error("Error deleting traveller:", error);
            setTravellerFormError(
                "We couldn’t remove this traveller. They may still be used in shared costs."
            );
            return false;
        }

        await fetchTripMembers();
        return true;
    }

    return {
        tripMembers,
        newTravellerName,
        setNewTravellerName,
        travellerFormError,
        setTravellerFormError,
        isAddingTraveller,
        fetchTripMembers,
        addTraveller,
        deleteTraveller,
    };
}