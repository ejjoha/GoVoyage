import type { Booking, BookingType } from "../types";
import { formatForDateTimeLocal } from "../utils";

export type BookingFormValues = {
    title: string;
    type: BookingType;
    startTime: string;
    endTime: string;
    location: string;
    confirmation: string;
    notes: string;
    airline: string;
    flightNumber: string;
    departure: string;
    arrival: string;
    hotelName: string;
    address: string;
    origin: string;
    destinationPoint: string;
};

export const emptyBookingFormValues: BookingFormValues = {
    title: "",
    type: "flight",
    startTime: "",
    endTime: "",
    location: "",
    confirmation: "",
    notes: "",
    airline: "",
    flightNumber: "",
    departure: "",
    arrival: "",
    hotelName: "",
    address: "",
    origin: "",
    destinationPoint: "",
};

export function getBookingFormValuesFromBooking(
    booking: Booking
): BookingFormValues {
    return {
        title: booking.title || "",
        type: booking.type,
        startTime: formatForDateTimeLocal(booking.start_time),
        endTime: formatForDateTimeLocal(booking.end_time),
        location: booking.location || "",
        confirmation: booking.confirmation_code || "",
        notes: booking.notes || "",
        airline: booking.airline || "",
        flightNumber: booking.flight_number || "",
        departure: booking.departure_airport || "",
        arrival: booking.arrival_airport || "",
        hotelName: booking.hotel_name || "",
        address: booking.address || "",
        origin: booking.origin || "",
        destinationPoint: booking.destination || "",
    };
}