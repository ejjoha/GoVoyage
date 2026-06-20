import type { UpdateTripPayload } from "../api";
import type { Trip } from "../types";
import { formatForDateInput } from "../utils";

export type TripFormValues = {
    title: string;
    destination: string;
    imageUrl: string;
    startDate: string;
    endDate: string;
    currencies: string[];
};

export function getTripFormValuesFromTrip(trip: Trip): TripFormValues {
    return {
        title: trip.title || "",
        destination: trip.destination || "",
        imageUrl: trip.image_url || "",
        startDate: formatForDateInput(trip.start_date),
        endDate: formatForDateInput(trip.end_date),
        currencies: trip.currencies?.length ? trip.currencies : ["NOK", "SEK", "EUR"],
    };
}

export function getUpdateTripPayload(values: TripFormValues): UpdateTripPayload {
    return {
        title: values.title.trim(),
        destination: values.destination.trim(),
        image_url: values.imageUrl.trim() || null,
        start_date: values.startDate,
        end_date: values.endDate,
        currencies: values.currencies,
    };
}