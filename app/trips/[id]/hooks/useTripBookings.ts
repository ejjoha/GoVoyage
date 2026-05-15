import { useState } from "react";
import { getBookings } from "../api";
import type { Booking } from "../types";

export function useTripBookings(tripId: number) {
    const [bookings, setBookings] = useState<Booking[]>([]);

    async function fetchBookings() {
        const { data, error } = await getBookings(tripId);

        if (error) {
            console.error("Error fetching bookings:", error);

            const cachedBookings = localStorage.getItem(`trip-bookings-${tripId}`);

            if (cachedBookings) {
                setBookings(JSON.parse(cachedBookings));
                return;
            }

            return;
        }

        setBookings(data || []);

        localStorage.setItem(
            `trip-bookings-${tripId}`,
            JSON.stringify(data || [])
        );
    }

    return {
        bookings,
        setBookings,
        fetchBookings,
    };
}