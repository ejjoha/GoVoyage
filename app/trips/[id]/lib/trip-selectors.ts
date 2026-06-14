import type { Booking, BookingFilter } from "../types";

export type BookingTimeBucket =
    | "Morning"
    | "Afternoon"
    | "Evening"
    | "Unscheduled";

export type GroupedBookings = Record<
    string,
    Record<BookingTimeBucket, Booking[]>
>;

export type HotelStay = {
    id: number;
    hotelName: string;
    address: string;
    startTime: string;
    endTime: string;
    nights: number;
};

export function getFilteredBookings(
    bookings: Booking[],
    activeFilter: BookingFilter
) {
    if (activeFilter === "all") return bookings;
    if (activeFilter === "flight") {
        return bookings.filter((booking) => booking.type === "flight");
    }
    if (activeFilter === "hotel") {
        return bookings.filter((booking) => booking.type === "hotel");
    }

    return bookings.filter(
        (booking) =>
            booking.type === "activity" ||
            booking.type === "transport" ||
            booking.type === "dining"
    );
}

export function getGroupedBookings(bookings: Booking[]) {
    return bookings.reduce((acc, booking) => {
        const rawDate = booking.start_time;
        const dateKey = rawDate ? new Date(rawDate).toDateString() : "No date";
        const hour = rawDate ? new Date(rawDate).getHours() : -1;

        let bucket: BookingTimeBucket = "Unscheduled";

        if (hour >= 0 && hour < 12) bucket = "Morning";
        else if (hour >= 12 && hour < 18) bucket = "Afternoon";
        else if (hour >= 18) bucket = "Evening";

        if (!acc[dateKey]) {
            acc[dateKey] = {
                Morning: [],
                Afternoon: [],
                Evening: [],
                Unscheduled: [],
            };
        }

        acc[dateKey][bucket].push(booking);

        return acc;
    }, {} as GroupedBookings);
}

export function getTripNights(startDate?: string, endDate?: string) {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
}

export function getHotelStays(bookings: Booking[]): HotelStay[] {
    return bookings
        .filter((booking) => booking.type === "hotel")
        .map((booking) => {
            const start = booking.start_time ? new Date(booking.start_time) : null;
            const end = booking.end_time ? new Date(booking.end_time) : null;

            let nights = 0;

            if (
                start &&
                end &&
                !Number.isNaN(start.getTime()) &&
                !Number.isNaN(end.getTime())
            ) {
                const diffMs = end.getTime() - start.getTime();
                const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
                nights = diffDays > 0 ? diffDays : 0;
            }

            return {
                id: booking.id,
                hotelName: booking.hotel_name || booking.title || "Hotel stay",
                address: booking.address || "",
                startTime: booking.start_time,
                endTime: booking.end_time || "",
                nights,
            };
        })
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
}