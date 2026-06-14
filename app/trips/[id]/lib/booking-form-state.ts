import type { Booking, BookingType } from "../types";
import { formatForDateTimeLocal } from "../utils";
import type { SaveBookingPayload } from "../api";

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

export function validateBookingFormValues(
    values: BookingFormValues,
    getStartLabel: (type: BookingFormValues["type"]) => string
): string | null {
    const resolvedTitle =
        values.type === "hotel" ? values.hotelName.trim() : values.title.trim();

    if (!resolvedTitle) {
        return values.type === "hotel"
            ? "Please fill in the hotel name."
            : "Please fill in the booking title.";
    }

    if (!values.startTime) {
        return values.type === "flight"
            ? "Please fill in the departure date and time."
            : `Please fill in ${getStartLabel(values.type).toLowerCase()}.`;
    }

    if (values.endTime && values.endTime < values.startTime) {
        return values.type === "flight"
            ? "Arrival cannot be before departure."
            : "End time cannot be before start time.";
    }

    if (
        values.type === "transport" &&
        (!values.origin.trim() || !values.destinationPoint.trim())
    ) {
        return "Please fill in both origin and destination.";
    }

    return null;
}

export function getSaveBookingPayload(
    values: BookingFormValues
): SaveBookingPayload {
    const resolvedTitle =
        values.type === "hotel" ? values.hotelName.trim() : values.title.trim();

    return {
        type: values.type,
        title: resolvedTitle,
        start_time: values.startTime,
        end_time: values.endTime || null,
        location:
            values.type === "flight" ||
                values.type === "hotel" ||
                values.type === "transport"
                ? null
                : values.location.trim() || null,
        confirmation_code: values.confirmation.trim() || null,
        notes: values.notes.trim() || null,
        airline: values.airline.trim() || null,
        flight_number: values.flightNumber.trim() || null,
        departure_airport: values.departure.trim() || null,
        arrival_airport: values.arrival.trim() || null,
        hotel_name: values.hotelName.trim() || null,
        address: values.address.trim() || null,
        origin: values.type === "transport" ? values.origin.trim() || null : null,
        destination:
            values.type === "transport"
                ? values.destinationPoint.trim() || null
                : null,
    };
}