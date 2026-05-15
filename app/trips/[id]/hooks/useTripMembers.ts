import { useState } from "react";
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
        const trimmedName = newTravellerName.trim();
        setTravellerFormError("");

        if (!trimmedName) {
            setTravellerFormError("Please enter a traveller name.");
            return;
        }

        const alreadyExists = tripMembers.some(
            (member) =>
                member.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );

        if (alreadyExists) {
            setTravellerFormError("That traveller is already on this trip.");
            return;
        }

        const { error } = await createTripMember(tripId, trimmedName);

        if (error) {
            console.error("Error adding traveller:", error);
            setTravellerFormError("We couldn’t add that traveller. Please try again.");
            return;
        }

        setNewTravellerName("");
        setTravellerFormError("");
        await fetchTripMembers();
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
        fetchTripMembers,
        addTraveller,
        deleteTraveller,
    };
}