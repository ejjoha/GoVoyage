import type { BookingFilter, BookingType } from "./types";

export function getBookingIcon(type: BookingType) {
  if (type === "flight") return "✈️";
  if (type === "hotel") return "🏨";
  if (type === "transport") return "🚆";
  if (type === "dining") return "🍽️";
  return "🎟️";
}

export function getTitlePlaceholder(type: BookingType) {
  if (type === "flight") return "e.g. Flight to London";
  if (type === "hotel") return "e.g. The Savoy";
  if (type === "transport") return "e.g. Airport Express";
  if (type === "dining") return "e.g. Dinner at Roscioli";
  return "e.g. Dinner cruise";
}

export function getLocationLabel(type: BookingType) {
  if (type === "dining") return "Address";
  return "Location";
}

export function getLocationPlaceholder(type: BookingType) {
  if (type === "hotel") return "e.g. Downtown Manhattan";
  if (type === "dining") return "e.g. Trastevere";
  return "e.g. Central Park";
}

export function getStartLabel(type: BookingType) {
  if (type === "hotel") return "Check-in date and time";
  if (type === "transport") return "Departure date and time";
  if (type === "dining") return "Reservation date and time";
  return "Start date and time";
}

export function getEndLabel(type: BookingType) {
  if (type === "hotel") return "Check-out date and time";
  if (type === "transport") return "Arrival date and time";
  if (type === "dining") return "End time (optional)";
  return "End date and time";
}

export function getConfirmationLabel(type: BookingType) {
  if (type === "transport") return "Ticket / booking code";
  if (type === "dining") return "Reservation code";
  return "Confirmation code";
}

export function getAccentBarClass(type: BookingType) {
  if (type === "flight") return "bg-blue-200";
  if (type === "hotel") return "bg-orange-200";
  if (type === "transport") return "bg-violet-200";
  if (type === "dining") return "bg-rose-200";
  return "bg-green-200";
}

export function getBadgeClass(type: BookingType) {
  if (type === "flight") return "bg-blue-100 text-blue-600";
  if (type === "hotel") return "bg-orange-100 text-orange-600";
  if (type === "transport") return "bg-violet-100 text-violet-600";
  if (type === "dining") return "bg-rose-100 text-rose-600";
  return "bg-green-100 text-green-600";
}

export function getExpandedPanelClass(type: BookingType) {
  if (type === "flight") return "bg-blue-50/70";
  if (type === "hotel") return "bg-orange-50/70";
  if (type === "transport") return "bg-violet-50/70";
  if (type === "dining") return "bg-rose-50/70";
  return "bg-green-50/70";
}

export function getDetailsHeading(type: BookingType) {
  if (type === "flight") return "Flight details";
  if (type === "hotel") return "Hotel details";
  if (type === "transport") return "Transport details";
  if (type === "dining") return "Dining details";
  return "Activity details";
}

export function getFilterLabel(filter: BookingFilter) {
  if (filter === "all") return "All";
  if (filter === "flight") return "Flights";
  if (filter === "hotel") return "Hotels";
  return "Plans";
}

export function formatDateTime(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const day = date.getDate();
  const month = date.toLocaleDateString("en-GB", { month: "short" });
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${hours}:${minutes}`;
}

export function formatTripDateRange(start?: string, end?: string) {
  if (!start || !end) return "";

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "";
  }

  const startText = startDate.toLocaleDateString([], {
    month: "long",
    day: "numeric",
  });

  const endText = endDate.toLocaleDateString([], {
    month: "long",
    day: "numeric",
  });

  return `${startText} – ${endText}`;
}

export function formatForDateTimeLocal(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatForDateInput(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}