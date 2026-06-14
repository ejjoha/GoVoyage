import type { Trip } from "../types";

export function getTripCacheKey(tripId: number) {
    return `cached-trip-${tripId}`;
}

export function loadCachedTrip(tripId: number): Trip | null {
    try {
        const cached = localStorage.getItem(getTripCacheKey(tripId));

        if (!cached) {
            return null;
        }

        return JSON.parse(cached) as Trip;
    } catch (error) {
        console.error("Error loading cached trip:", error);
        localStorage.removeItem(getTripCacheKey(tripId));
        return null;
    }
}

export function saveCachedTrip(tripId: number, trip: Trip) {
    try {
        localStorage.setItem(getTripCacheKey(tripId), JSON.stringify(trip));
    } catch (error) {
        console.error("Error saving cached trip:", error);
    }
}

export function removeCachedTrip(tripId: number) {
    localStorage.removeItem(getTripCacheKey(tripId));
}