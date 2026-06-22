import { useCallback, useEffect, useState } from "react";
import {
    createBooking,
    deleteBookingById,
    getBookings,
    updateBooking,
    type SaveBookingPayload,
} from "../api";
import type { Booking } from "../types";

type SyncStatus =
    | "idle"
    | "saved-offline"
    | "syncing"
    | "synced"
    | "failed"
    | "conflict";

type BookingMutation =
    | {
        mutationId: string;
        type: "create_booking";
        tripId: number;
        localId: number;
        payload: SaveBookingPayload;
        createdAt: string;
    }
    | {
        mutationId: string;
        type: "update_booking";
        tripId: number;
        bookingId: number;
        payload: SaveBookingPayload;
        baseUpdatedAt?: string | null;
        createdAt: string;
    }
    | {
        mutationId: string;
        type: "delete_booking";
        tripId: number;
        bookingId: number;
        baseUpdatedAt?: string | null;
        createdAt: string;
    };

function getBookingsCacheKey(tripId: number) {
    return `trip-bookings-${tripId}`;
}

function getMutationsCacheKey(tripId: number) {
    return `trip-booking-mutations-${tripId}`;
}

function createMutationId() {
    return `booking-mutation-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;
}

function normalizeOptional(value: string | null | undefined) {
    return value || undefined;
}

function createLocalBooking(
    id: number,
    payload: SaveBookingPayload
): Booking {
    return {
        id,
        title: payload.title,
        type: payload.type as Booking["type"],
        start_time: payload.start_time,
        end_time: normalizeOptional(payload.end_time),
        location: normalizeOptional(payload.location),
        confirmation_code: normalizeOptional(payload.confirmation_code),
        notes: normalizeOptional(payload.notes),
        airline: normalizeOptional(payload.airline),
        flight_number: normalizeOptional(payload.flight_number),
        departure_airport: normalizeOptional(payload.departure_airport),
        arrival_airport: normalizeOptional(payload.arrival_airport),
        hotel_name: normalizeOptional(payload.hotel_name),
        address: normalizeOptional(payload.address),
        origin: normalizeOptional(payload.origin),
        destination: normalizeOptional(payload.destination),
    };
}

export function useTripBookings(tripId: number) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
    const [pendingMutationCount, setPendingMutationCount] = useState(0);

    const bookingsCacheKey = getBookingsCacheKey(tripId);
    const mutationsCacheKey = getMutationsCacheKey(tripId);

    const readCachedBookings = useCallback((): Booking[] => {
        if (typeof window === "undefined") return [];

        const cachedBookings = localStorage.getItem(bookingsCacheKey);
        if (!cachedBookings) return [];

        try {
            return JSON.parse(cachedBookings) as Booking[];
        } catch {
            return [];
        }
    }, [bookingsCacheKey]);

    const writeCachedBookings = useCallback(
        (nextBookings: Booking[]) => {
            if (typeof window === "undefined") return;

            localStorage.setItem(
                bookingsCacheKey,
                JSON.stringify(nextBookings)
            );
        },
        [bookingsCacheKey]
    );

    const readPendingMutations = useCallback((): BookingMutation[] => {
        if (typeof window === "undefined") return [];

        const cachedMutations = localStorage.getItem(mutationsCacheKey);
        if (!cachedMutations) return [];

        try {
            return JSON.parse(cachedMutations) as BookingMutation[];
        } catch {
            return [];
        }
    }, [mutationsCacheKey]);

    const writePendingMutations = useCallback(
        (mutations: BookingMutation[]) => {
            if (typeof window === "undefined") return;

            localStorage.setItem(mutationsCacheKey, JSON.stringify(mutations));
            setPendingMutationCount(mutations.length);
        },
        [mutationsCacheKey]
    );

    const refreshPendingMutationCount = useCallback(() => {
        setPendingMutationCount(readPendingMutations().length);
    }, [readPendingMutations]);

    const updateBookingsLocally = useCallback(
        (updater: (current: Booking[]) => Booking[]) => {
            setBookings((current) => {
                const base = current.length > 0 ? current : readCachedBookings();
                const next = updater(base);

                writeCachedBookings(next);

                return next;
            });
        },
        [readCachedBookings, writeCachedBookings]
    );

    const fetchBookings = useCallback(async () => {
        const { data, error } = await getBookings(tripId);

        if (error) {
            console.error("Error fetching bookings:", error);

            const cachedBookings = readCachedBookings();

            if (cachedBookings.length > 0) {
                setBookings(cachedBookings);
            }

            return;
        }

        setBookings(data || []);
        writeCachedBookings(data || []);
        refreshPendingMutationCount();
    }, [
        tripId,
        readCachedBookings,
        writeCachedBookings,
        refreshPendingMutationCount,
    ]);

    const syncPendingBookingMutations = useCallback(async () => {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
            setSyncStatus("saved-offline");
            return;
        }

        let pendingMutations = readPendingMutations();

        if (pendingMutations.length === 0) {
            setSyncStatus("synced");
            setPendingMutationCount(0);
            return;
        }

        setSyncStatus("syncing");

        for (const mutation of pendingMutations) {
            try {
                if (mutation.type === "create_booking") {
                    const { data, error } = await createBooking(
                        mutation.tripId,
                        mutation.payload
                    );

                    if (error) throw error;

                    if (data) {
                        updateBookingsLocally((current) =>
                            current.map((booking) =>
                                booking.id === mutation.localId
                                    ? (data as Booking)
                                    : booking
                            )
                        );
                    }
                }

                if (mutation.type === "update_booking") {
                    const { data, error } = await updateBooking(
                        mutation.bookingId,
                        mutation.payload,
                        mutation.baseUpdatedAt
                    );

                    if (error) throw error;

                    if (!data) {
                        setSyncStatus("conflict");
                        return;
                    }

                    if (data) {
                        updateBookingsLocally((current) =>
                            current.map((booking) =>
                                booking.id === mutation.bookingId
                                    ? (data as Booking)
                                    : booking
                            )
                        );
                    }
                }

                if (mutation.type === "delete_booking") {
                    const { data, error } = await deleteBookingById(
                        mutation.bookingId,
                        mutation.baseUpdatedAt
                    );

                    if (error) throw error;

                    if (!data) {
                        setSyncStatus("conflict");
                        return;
                    }
                }

                pendingMutations = pendingMutations.filter(
                    (queuedMutation) =>
                        queuedMutation.mutationId !== mutation.mutationId
                );

                writePendingMutations(pendingMutations);
            } catch (error) {
                console.error("Error syncing booking mutation:", error);
                setSyncStatus("failed");
                return;
            }
        }

        setSyncStatus("synced");
        await fetchBookings();
    }, [
        fetchBookings,
        readPendingMutations,
        updateBookingsLocally,
        writePendingMutations,
    ]);

    async function saveBookingOfflineFirst({
        editingBookingId,
        payload,
    }: {
        editingBookingId: number | null;
        payload: SaveBookingPayload;
    }) {
        const now = new Date().toISOString();

        if (editingBookingId) {
            const existingBooking =
                bookings.find((booking) => booking.id === editingBookingId) ||
                readCachedBookings().find((booking) => booking.id === editingBookingId);

            const baseUpdatedAt = existingBooking?.updated_at || null;

            const updatedLocalBooking = createLocalBooking(
                editingBookingId,
                payload
            );

            updateBookingsLocally((current) =>
                current.map((booking) =>
                    booking.id === editingBookingId
                        ? {
                            ...booking,
                            ...updatedLocalBooking,
                        }
                        : booking
                )
            );

            const currentMutations = readPendingMutations();

            if (editingBookingId < 0) {
                const mergedMutations = currentMutations.map((mutation) => {
                    if (
                        mutation.type === "create_booking" &&
                        mutation.localId === editingBookingId
                    ) {
                        return {
                            ...mutation,
                            payload,
                        };
                    }

                    return mutation;
                });

                writePendingMutations(mergedMutations);
            } else {
                const nextMutations: BookingMutation[] = [
                    ...currentMutations.filter(
                        (mutation) =>
                            !(
                                mutation.type === "update_booking" &&
                                mutation.bookingId === editingBookingId
                            )
                    ),
                    {
                        mutationId: createMutationId(),
                        type: "update_booking",
                        tripId,
                        bookingId: editingBookingId,
                        payload,
                        baseUpdatedAt,
                        createdAt: now,
                    },
                ];

                writePendingMutations(nextMutations);
            }
        } else {
            const localId = -Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`);
            const localBooking = createLocalBooking(localId, payload);

            updateBookingsLocally((current) => [
                ...current.filter((booking) => booking.id !== localId),
                localBooking,
            ]);

            writePendingMutations([
                ...readPendingMutations(),
                {
                    mutationId: createMutationId(),
                    type: "create_booking",
                    tripId,
                    localId,
                    payload,
                    createdAt: now,
                },
            ]);
        }

        if (typeof navigator !== "undefined" && navigator.onLine) {
            await syncPendingBookingMutations();
            return;
        }

        setSyncStatus("saved-offline");
    }

    async function deleteBookingOfflineFirst(bookingId: number) {
        const existingBooking =
            bookings.find((booking) => booking.id === bookingId) ||
            readCachedBookings().find((booking) => booking.id === bookingId);

        const baseUpdatedAt = existingBooking?.updated_at || null;

        updateBookingsLocally((current) =>
            current.filter((booking) => booking.id !== bookingId)
        );

        const currentMutations = readPendingMutations();

        if (bookingId < 0) {
            const nextMutations = currentMutations.filter((mutation) => {
                if (
                    mutation.type === "create_booking" &&
                    mutation.localId === bookingId
                ) {
                    return false;
                }

                if (
                    mutation.type === "update_booking" &&
                    mutation.bookingId === bookingId
                ) {
                    return false;
                }

                return true;
            });

            writePendingMutations(nextMutations);
            setSyncStatus("saved-offline");
            return;
        }

        const nextMutations: BookingMutation[] = [
            ...currentMutations.filter((mutation) => {
                if (
                    mutation.type === "update_booking" &&
                    mutation.bookingId === bookingId
                ) {
                    return false;
                }

                if (
                    mutation.type === "delete_booking" &&
                    mutation.bookingId === bookingId
                ) {
                    return false;
                }

                return true;
            }),
            {
                mutationId: createMutationId(),
                type: "delete_booking",
                tripId,
                bookingId,
                baseUpdatedAt,
                createdAt: new Date().toISOString(),
            },
        ];

        writePendingMutations(nextMutations);

        if (typeof navigator !== "undefined" && navigator.onLine) {
            await syncPendingBookingMutations();
            return;
        }

        setSyncStatus("saved-offline");
    }

    useEffect(() => {
        refreshPendingMutationCount();
    }, [refreshPendingMutationCount]);

    useEffect(() => {
        function handleOnline() {
            syncPendingBookingMutations();
        }

        window.addEventListener("online", handleOnline);

        return () => {
            window.removeEventListener("online", handleOnline);
        };
    }, [syncPendingBookingMutations]);

    return {
        bookings,
        setBookings,
        fetchBookings,
        saveBookingOfflineFirst,
        deleteBookingOfflineFirst,
        syncPendingBookingMutations,
        pendingMutationCount,
        syncStatus,
    };
}