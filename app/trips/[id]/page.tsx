"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Trip = {
  id: number;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  image_url?: string;
};

type BookingType =
  | "flight"
  | "hotel"
  | "activity"
  | "transport"
  | "dining";

type BookingFilter = "all" | "flight" | "hotel" | "plans";

type Booking = {
  id: number;
  title: string;
  type: BookingType;
  start_time: string;
  end_time?: string;
  location?: string;
  confirmation_code?: string;
  notes?: string;
  airline?: string;
  flight_number?: string;
  departure_airport?: string;
  arrival_airport?: string;
  hotel_name?: string;
  address?: string;
  origin?: string;
  destination?: string;
};

function getBookingIcon(type: BookingType) {
  if (type === "flight") return "✈️";
  if (type === "hotel") return "🏨";
  if (type === "transport") return "🚆";
  if (type === "dining") return "🍽️";
  return "🎟️";
}

function getTitlePlaceholder(type: BookingType) {
  if (type === "flight") return "e.g. Flight to London";
  if (type === "hotel") return "e.g. The Savoy";
  if (type === "transport") return "e.g. Airport Express";
  if (type === "dining") return "e.g. Dinner at Roscioli";
  return "e.g. Dinner cruise";
}

function getLocationLabel(type: BookingType) {
  if (type === "dining") return "Address";
  return "Location";
}

function getLocationPlaceholder(type: BookingType) {
  if (type === "hotel") return "e.g. Downtown Manhattan";
  if (type === "dining") return "e.g. Trastevere";
  return "e.g. Central Park";
}

function getStartLabel(type: BookingType) {
  if (type === "hotel") return "Check-in date and time";
  if (type === "transport") return "Departure date and time";
  if (type === "dining") return "Reservation date and time";
  return "Start date and time";
}

function getEndLabel(type: BookingType) {
  if (type === "hotel") return "Check-out date and time";
  if (type === "transport") return "Arrival date and time";
  if (type === "dining") return "End time (optional)";
  return "End date and time";
}

function getConfirmationLabel(type: BookingType) {
  if (type === "transport") return "Ticket / booking code";
  if (type === "dining") return "Reservation code";
  return "Confirmation code";
}

function getAccentBarClass(type: BookingType) {
  if (type === "flight") return "bg-blue-200";
  if (type === "hotel") return "bg-orange-200";
  if (type === "transport") return "bg-violet-200";
  if (type === "dining") return "bg-rose-200";
  return "bg-green-200";
}

function getBadgeClass(type: BookingType) {
  if (type === "flight") return "bg-blue-100 text-blue-600";
  if (type === "hotel") return "bg-orange-100 text-orange-600";
  if (type === "transport") return "bg-violet-100 text-violet-600";
  if (type === "dining") return "bg-rose-100 text-rose-600";
  return "bg-green-100 text-green-600";
}

function getExpandedPanelClass(type: BookingType) {
  if (type === "flight") return "bg-blue-50/70";
  if (type === "hotel") return "bg-orange-50/70";
  if (type === "transport") return "bg-violet-50/70";
  if (type === "dining") return "bg-rose-50/70";
  return "bg-green-50/70";
}

function getDetailsHeading(type: BookingType) {
  if (type === "flight") return "Flight details";
  if (type === "hotel") return "Hotel details";
  if (type === "transport") return "Transport details";
  if (type === "dining") return "Dining details";
  return "Activity details";
}

function getFilterLabel(filter: BookingFilter) {
  if (filter === "all") return "All";
  if (filter === "flight") return "Flights";
  if (filter === "hotel") return "Hotels";
  return "Plans";
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value) return null;

  return (
    <div className="grid w-full grid-cols-[96px_minmax(0,1fr)] gap-3 border-b border-stone-200/80 py-2">
      <span className="min-w-0 text-stone-500">{label}</span>
      <span className="min-w-0 break-words text-right font-medium text-stone-800">
        {value}
      </span>
    </div>
  );
}

function formatDateTime(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const day = date.getDate();
  const month = date.toLocaleDateString("en-GB", { month: "short" });
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${hours}:${minutes}`;
}

function formatTripDateRange(start?: string, end?: string) {
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

function formatForDateTimeLocal(value?: string) {
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

function formatForDateInput(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function TripPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isTripLoading, setIsTripLoading] = useState(true);

  const [showTripForm, setShowTripForm] = useState(false);
  const [tripSuccessMessage, setTripSuccessMessage] = useState("");

  const [editTripTitle, setEditTripTitle] = useState("");
  const [editTripDestination, setEditTripDestination] = useState("");
  const [editTripImageUrl, setEditTripImageUrl] = useState("");
  const [editTripStartDate, setEditTripStartDate] = useState("");
  const [editTripEndDate, setEditTripEndDate] = useState("");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeFilter, setActiveFilter] = useState<BookingFilter>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<BookingType>("flight");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newConfirmation, setNewConfirmation] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newAirline, setNewAirline] = useState("");
  const [newFlightNumber, setNewFlightNumber] = useState("");
  const [newDeparture, setNewDeparture] = useState("");
  const [newArrival, setNewArrival] = useState("");
  const [newHotelName, setNewHotelName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newOrigin, setNewOrigin] = useState("");
  const [newDestinationPoint, setNewDestinationPoint] = useState("");

  const bookingFormRef = useRef<HTMLFormElement | null>(null);

  async function fetchTrip() {
    setIsTripLoading(true);

    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error loading trip:", error);
      setTrip(null);
      setIsTripLoading(false);
      return;
    }

    const tripData = data as Trip;
    setTrip(tripData);

    setEditTripTitle(tripData.title || "");
    setEditTripDestination(tripData.destination || "");
    setEditTripImageUrl(tripData.image_url || "");
    setEditTripStartDate(formatForDateInput(tripData.start_date));
    setEditTripEndDate(formatForDateInput(tripData.end_date));

    setIsTripLoading(false);
  }

  async function fetchBookings() {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("trip_id", id)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error loading bookings:", error);
      return;
    }

    setBookings((data || []) as Booking[]);
  }

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setIsTripLoading(false);
      return;
    }

    fetchTrip();
    fetchBookings();
  }, [id]);

  function resetTripFormFromTrip() {
    if (!trip) return;

    setEditTripTitle(trip.title || "");
    setEditTripDestination(trip.destination || "");
    setEditTripImageUrl(trip.image_url || "");
    setEditTripStartDate(formatForDateInput(trip.start_date));
    setEditTripEndDate(formatForDateInput(trip.end_date));
    setShowTripForm(false);
  }

  async function handleSaveTrip(e: React.FormEvent) {
    e.preventDefault();

    if (!editTripTitle.trim() || !editTripDestination.trim()) {
      alert("Please fill in Title and Destination");
      return;
    }

    if (!editTripStartDate || !editTripEndDate) {
      alert("Please fill in Start date and End date");
      return;
    }

    const { error } = await supabase
      .from("trips")
      .update({
        title: editTripTitle.trim(),
        destination: editTripDestination.trim(),
        image_url: editTripImageUrl.trim(),
        start_date: editTripStartDate,
        end_date: editTripEndDate,
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating trip:", error);
      alert("Failed to update trip");
      return;
    }

    await fetchTrip();
    setTripSuccessMessage("Trip updated");
    setShowTripForm(false);

    setTimeout(() => {
      setTripSuccessMessage("");
    }, 2000);
  }

  async function handleDeleteTrip() {
    const shouldDelete = confirm("Delete this trip?");
    if (!shouldDelete) return;

    const { error } = await supabase.from("trips").delete().eq("id", id);

    if (error) {
      console.error("Error deleting trip:", error);
      alert("Could not delete trip");
      return;
    }

    router.push("/");
  }

  async function deleteBooking(bookingId: number) {
    const shouldDelete = confirm("Delete this booking?");
    if (!shouldDelete) return;

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (error) {
      console.error("Error deleting booking:", error);
      alert("Could not delete booking");
      return;
    }

    await fetchBookings();

    if (expandedId === bookingId) {
      setExpandedId(null);
    }
  }

  function startEditingBooking(booking: Booking) {
    setEditingBookingId(booking.id);
    setShowForm(true);
    setShowTripForm(false);
    setExpandedId(null);

    setNewTitle(booking.title || "");
    setNewType(booking.type);
    setNewStartTime(formatForDateTimeLocal(booking.start_time));
    setNewEndTime(formatForDateTimeLocal(booking.end_time));
    setNewLocation(booking.location || "");
    setNewConfirmation(booking.confirmation_code || "");
    setNewNotes(booking.notes || "");
    setNewAirline(booking.airline || "");
    setNewFlightNumber(booking.flight_number || "");
    setNewDeparture(booking.departure_airport || "");
    setNewArrival(booking.arrival_airport || "");
    setNewHotelName(booking.hotel_name || "");
    setNewAddress(booking.address || "");
    setNewOrigin(booking.origin || "");
    setNewDestinationPoint(booking.destination || "");

    requestAnimationFrame(() => {
      setTimeout(() => {
        bookingFormRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    });
  }

  function resetForm() {
    setEditingBookingId(null);
    setNewTitle("");
    setNewType("flight");
    setNewStartTime("");
    setNewEndTime("");
    setNewLocation("");
    setNewConfirmation("");
    setNewNotes("");
    setNewAirline("");
    setNewFlightNumber("");
    setNewDeparture("");
    setNewArrival("");
    setNewHotelName("");
    setNewAddress("");
    setNewOrigin("");
    setNewDestinationPoint("");
    setShowForm(false);
  }

  function openNewBookingForm() {
    resetForm();
    setShowForm(true);
    setShowTripForm(false);

    requestAnimationFrame(() => {
      setTimeout(() => {
        bookingFormRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    });
  }

  async function handleSaveBooking(e: React.FormEvent) {
    e.preventDefault();

    const resolvedTitle =
      newType === "hotel" ? newHotelName.trim() : newTitle.trim();

    if (!resolvedTitle) {
      alert(
        newType === "hotel"
          ? "Please fill in Hotel name"
          : "Please fill in Title"
      );
      return;
    }

    if (!newStartTime) {
      alert(
        newType === "flight"
          ? "Please fill in departure"
          : `Please fill in ${getStartLabel(newType).toLowerCase()}`
      );
      return;
    }

    if (newType === "transport" && (!newOrigin.trim() || !newDestinationPoint.trim())) {
      alert("Please fill in both origin and destination");
      return;
    }

    const payload = {
      type: newType,
      title: resolvedTitle,
      start_time: newStartTime,
      end_time: newEndTime || null,
      location:
        newType === "flight" || newType === "hotel" || newType === "transport"
          ? null
          : newLocation.trim() || null,
      confirmation_code: newConfirmation.trim() || null,
      notes: newNotes.trim() || null,
      airline: newAirline.trim() || null,
      flight_number: newFlightNumber.trim() || null,
      departure_airport: newDeparture.trim() || null,
      arrival_airport: newArrival.trim() || null,
      hotel_name: newHotelName.trim() || null,
      address: newAddress.trim() || null,
      origin: newType === "transport" ? newOrigin.trim() || null : null,
      destination:
        newType === "transport" ? newDestinationPoint.trim() || null : null,
    };

    let error = null;

    if (editingBookingId) {
      const response = await supabase
        .from("bookings")
        .update(payload)
        .eq("id", editingBookingId);

      error = response.error;
    } else {
      const response = await supabase.from("bookings").insert({
        trip_id: id,
        ...payload,
      });

      error = response.error;
    }

    if (error) {
      console.error("Error saving booking:", error);
      alert("Save failed. Check the browser console.");
      return;
    }

    const wasEditing = Boolean(editingBookingId);

    await fetchBookings();

    setSuccessMessage(wasEditing ? "Booking updated" : "Booking saved");
    resetForm();

    setTimeout(() => {
      setSuccessMessage("");
    }, 2000);
  }

  const filteredBookings = useMemo(() => {
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
  }, [bookings, activeFilter]);

  const groupedBookings = filteredBookings.reduce((acc, booking) => {
    const rawDate = booking.start_time;
    const dateKey = rawDate ? new Date(rawDate).toDateString() : "No date";
    const hour = rawDate ? new Date(rawDate).getHours() : -1;

    let bucket: "Morning" | "Afternoon" | "Evening" | "Unscheduled" =
      "Unscheduled";

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
  }, {} as Record<
    string,
    {
      Morning: Booking[];
      Afternoon: Booking[];
      Evening: Booking[];
      Unscheduled: Booking[];
    }
  >);

  const filterOptions: BookingFilter[] = ["all", "flight", "hotel", "plans"];

  if (isTripLoading) {
    return <div className="p-8">Loading trip...</div>;
  }

  if (!trip) {
    return <div className="p-8">Trip not found</div>;
  }

  return (
    <main className="mx-auto w-full max-w-2xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      {trip.image_url && (
        <div className="relative mb-6 w-full overflow-hidden rounded-3xl shadow-md">
          <img
            src={trip.image_url}
            alt={trip.title}
            className="h-56 w-full object-cover sm:h-72"
          />

          <div className="absolute bottom-5 left-5 right-5 min-w-0 rounded-3xl border border-white/30 bg-black/5 p-3 text-white backdrop-blur-sm sm:p-4">
            <h1 className="text-3xl font-bold leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              {trip.title}
            </h1>
            <p className="mt-1 text-sm text-white/90">
              {formatTripDateRange(trip.start_date, trip.end_date)}
            </p>
            <p className="text-xs text-white/80">{trip.destination}</p>
          </div>
        </div>
      )}

      {!showForm && (
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-stone-600 shadow-sm backdrop-blur transition-all duration-200 hover:border-stone-300 hover:bg-white hover:text-stone-800 hover:shadow-md active:scale-[0.98]"
        >
          <span className="text-base leading-none">←</span>
          <span>Back to trips</span>
        </Link>
      )}

      {!showForm && (
        <div className="mb-5 grid w-full grid-cols-[auto_1fr] gap-3">
          <button
            onClick={() => {
              if (showTripForm) {
                resetTripFormFromTrip();
              } else {
                setShowTripForm(true);
              }
            }}
            className="rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-rose-600 hover:shadow-lg active:scale-[0.97] active:shadow-sm"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-lg">✎</span>
              {showTripForm ? "Close" : "Edit trip"}
            </span>
          </button>

          <button
            onClick={openNewBookingForm}
            className="w-full rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-800 active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-lg">＋</span>
              Add booking
            </span>
          </button>
        </div>
      )}

      {!showForm && bookings.length > 0 && (
        <div className="mb-6 w-full">
          <div className="grid w-full grid-cols-4 gap-2 rounded-[1.75rem] bg-stone-100 p-2">
            {filterOptions.map((filter) => {
              const isActive = activeFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  aria-label={getFilterLabel(filter)}
                  className={`flex h-12 items-center justify-center rounded-2xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white text-stone-900 shadow-sm ring-1 ring-stone-200"
                      : "bg-transparent text-stone-500 hover:bg-stone-200 hover:text-stone-700"
                  }`}
                >
                  {filter === "all" && <span>All</span>}
                  {filter === "flight" && <span className="text-lg">✈️</span>}
                  {filter === "hotel" && <span className="text-lg">🏨</span>}
                  {filter === "plans" && <span className="text-lg">🗺️</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tripSuccessMessage && (
        <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {tripSuccessMessage}
        </div>
      )}

      {showTripForm && (
        <form
          onSubmit={handleSaveTrip}
          className="mb-6 space-y-3 rounded-2xl border border-stone-200 bg-white p-4"
        >
          <h2 className="text-lg font-semibold">Edit trip</h2>

          <input
            type="text"
            placeholder="Trip title"
            value={editTripTitle}
            onChange={(e) => setEditTripTitle(e.target.value)}
            className="w-full rounded border p-2"
          />

          <input
            type="text"
            placeholder="Destination"
            value={editTripDestination}
            onChange={(e) => setEditTripDestination(e.target.value)}
            className="w-full rounded border p-2"
          />

          <input
            type="text"
            placeholder="Image URL"
            value={editTripImageUrl}
            onChange={(e) => setEditTripImageUrl(e.target.value)}
            className="w-full rounded border p-2"
          />

          <input
            type="date"
            value={editTripStartDate}
            onChange={(e) => setEditTripStartDate(e.target.value)}
            className="w-full rounded border p-2"
          />

          <input
            type="date"
            value={editTripEndDate}
            onChange={(e) => setEditTripEndDate(e.target.value)}
            className="w-full rounded border p-2"
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-green-500 px-5 py-3 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-green-600 hover:shadow-lg active:scale-[0.97]"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-lg">✓</span>
              Update trip
            </span>
          </button>

          <button
            type="button"
            onClick={handleDeleteTrip}
            className="w-full rounded-xl bg-red-50 px-5 py-3 text-sm font-medium text-red-500 shadow-sm transition-all duration-200 hover:bg-red-100 hover:shadow-md active:scale-[0.97]"
          >
            Delete trip
          </button>
        </form>
      )}

      {successMessage && (
        <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {successMessage}
        </div>
      )}

      {showForm && (
        <form
          ref={bookingFormRef}
          onSubmit={handleSaveBooking}
          className="mb-6 space-y-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                className={`text-lg font-semibold ${
                  editingBookingId ? "text-amber-600" : "text-green-600"
                }`}
              >
                {editingBookingId ? "Editing booking" : "New booking"}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Add the key details for this part of your trip.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="shrink-0 text-sm text-stone-500 underline"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Booking type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as BookingType)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
              >
                <option value="flight">Flight</option>
                <option value="hotel">Hotel</option>
                <option value="activity">Activity</option>
                <option value="transport">Transport</option>
                <option value="dining">Dining</option>
              </select>
            </div>

            {newType !== "hotel" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-stone-700">
                  Title
                </label>
                <input
                  type="text"
                  placeholder={getTitlePlaceholder(newType)}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                />
              </div>
            )}
          </div>

          {newType === "hotel" ? (
            <>
              <div className="space-y-4 rounded-2xl bg-orange-50/60 p-4">
                <h3 className="text-sm font-semibold text-stone-700">
                  Hotel details
                </h3>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    Hotel name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. The Savoy"
                    value={newHotelName}
                    onChange={(e) => setNewHotelName(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    {getStartLabel(newType)}
                  </label>
                  <input
                    type="datetime-local"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    {getEndLabel(newType)}
                  </label>
                  <input
                    type="datetime-local"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="Hotel address"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    {getConfirmationLabel(newType)}
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={newConfirmation}
                    onChange={(e) => setNewConfirmation(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Anything important to remember?"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>
              </div>
            </>
          ) : newType === "flight" ? (
            <>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    Departure
                  </label>
                  <input
                    type="datetime-local"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    Arrival
                  </label>
                  <input
                    type="datetime-local"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-2xl bg-blue-50/60 p-4">
                <h3 className="text-sm font-semibold text-stone-700">
                  Flight details
                </h3>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    Departure airport
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. OSL"
                    value={newDeparture}
                    onChange={(e) => setNewDeparture(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    Arrival airport
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LHR"
                    value={newArrival}
                    onChange={(e) => setNewArrival(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    Airline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Norwegian"
                    value={newAirline}
                    onChange={(e) => setNewAirline(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    Flight number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DY123"
                    value={newFlightNumber}
                    onChange={(e) => setNewFlightNumber(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    {getConfirmationLabel(newType)}
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={newConfirmation}
                    onChange={(e) => setNewConfirmation(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Anything important to remember?"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>
              </div>
            </>
          ) : newType === "transport" ? (
            <>
              <div className="space-y-4 rounded-2xl bg-violet-50/70 p-4">
                <h3 className="text-sm font-semibold text-stone-700">
                  Transport details
                </h3>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    Origin
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Oslo Central Station"
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    Destination
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Stockholm Central Station"
                    value={newDestinationPoint}
                    onChange={(e) => setNewDestinationPoint(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    {getStartLabel(newType)}
                  </label>
                  <input
                    type="datetime-local"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    {getEndLabel(newType)}
                  </label>
                  <input
                    type="datetime-local"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    {getConfirmationLabel(newType)}
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={newConfirmation}
                    onChange={(e) => setNewConfirmation(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Anything important to remember?"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>
              </div>
            </>
          ) : newType === "dining" ? (
            <>
              <div className="space-y-4 rounded-2xl border border-rose-200/70 bg-rose-50/60 p-4">
                <h3 className="text-sm font-semibold text-stone-700">
                  Reservation details
                </h3>

                <div className="rounded-2xl border border-rose-200/70 bg-white/80 p-4 shadow-sm">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-full">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                        Restaurant
                      </p>
                      <p className="mt-1 text-base font-semibold text-stone-900">
                        {newTitle || "Your reservation"}
                      </p>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-xl">🍽️</span>
                      <div className="mt-1 h-px w-12 bg-rose-200" />
                    </div>

                    <div className="w-full space-y-1.5 text-left">
                      <label className="text-sm font-medium text-stone-700">
                        Reservation date and time
                      </label>
                      <input
                        type="datetime-local"
                        value={newStartTime}
                        onChange={(e) => setNewStartTime(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Via Roma 12"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    Reservation code
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={newConfirmation}
                    onChange={(e) => setNewConfirmation(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Anything important to remember?"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4 rounded-2xl bg-stone-50 p-4">
                <h3 className="text-sm font-semibold text-stone-700">Timing</h3>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    {getStartLabel(newType)}
                  </label>
                  <input
                    type="datetime-local"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    {getEndLabel(newType)}
                  </label>
                  <input
                    type="datetime-local"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    {getLocationLabel(newType)}
                  </label>
                  <input
                    type="text"
                    placeholder={getLocationPlaceholder(newType)}
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    {getConfirmationLabel(newType)}
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={newConfirmation}
                    onChange={(e) => setNewConfirmation(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">
                    Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Anything important to remember?"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>
              </div>
            </>
          )}

          <div className="sticky bottom-0 left-0 right-0 z-10 -mx-4 border-t border-stone-200 bg-white/95 p-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
            <button
              type="submit"
              className="w-full rounded-2xl bg-green-500 px-5 py-3.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-green-600 hover:shadow-lg active:scale-[0.97]"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-lg">✓</span>
                {editingBookingId ? "Update booking" : "Save booking"}
              </span>
            </button>
          </div>
        </form>
      )}

      {filteredBookings.length === 0 && bookings.length > 0 && !showForm && (
        <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
          <p className="text-base font-medium text-stone-700">
            No {getFilterLabel(activeFilter).toLowerCase()} yet
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Try another filter or add a new booking.
          </p>
        </div>
      )}

      {bookings.length === 0 && (
        <div className="mt-16 text-center text-gray-400">
          <p className="text-lg">No bookings yet</p>
          <p className="mt-1 text-sm">Tap “Add booking” to start your trip ✈️</p>
        </div>
      )}

      {filteredBookings.length > 0 && (
        <div className="w-full space-y-4">
          {Object.entries(groupedBookings).map(([date, items]) => (
            <div key={date} className="w-full min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="inline-block rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">
                  {date === "No date"
                    ? "No date"
                    : new Date(date).toLocaleDateString([], {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                </div>

                {new Date(date).toDateString() === new Date().toDateString() && (
                  <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-600">
                    Today
                  </span>
                )}
              </div>

              <div className="w-full space-y-4">
                {Object.entries(items).map(([bucket, bucketBookings]) => {
                  if (bucketBookings.length === 0) return null;

                  return (
                    <div key={bucket} className="w-full min-w-0">
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
                        {bucket}
                      </h3>

                      <div className="w-full space-y-3">
                        {bucketBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="grid w-full min-w-0 grid-cols-[2rem_minmax(0,1fr)] items-start gap-3"
                          >
                            <div className="relative flex h-full justify-center">
                              <div className="absolute bottom-0 top-0 w-px bg-gradient-to-b from-stone-300 to-stone-400/60" />
                              <div className="relative z-10 mt-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-stone-400 bg-white shadow-sm">
                                {getBookingIcon(booking.type)}
                              </div>
                            </div>

                            <div
                              onClick={() => {
                                setExpandedId(
                                  expandedId === booking.id ? null : booking.id
                                );
                              }}
                              className="mb-2 w-full min-w-0 overflow-hidden rounded-3xl border border-stone-200 bg-white p-4 shadow-md sm:p-5"
                            >
                              <div
                                className={`mb-4 h-1.5 rounded-full ${getAccentBarClass(
                                  booking.type
                                )}`}
                              />

                              <div className="flex w-full min-w-0 items-center justify-between gap-3">
                                <span
                                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${getBadgeClass(
                                    booking.type
                                  )}`}
                                >
                                  {booking.type}
                                </span>

                                <span
                                  className={`flex h-6 w-6 items-center justify-center text-stone-400 transition-transform duration-300 ${
                                    expandedId === booking.id
                                      ? "rotate-180"
                                      : "rotate-0"
                                  }`}
                                >
                                  ⌄
                                </span>
                              </div>

                              <h2 className="mt-3 break-words text-base font-semibold leading-snug text-stone-800 sm:text-lg">
                                {booking.type === "hotel"
                                  ? booking.hotel_name || booking.title
                                  : booking.title}
                              </h2>

                              <p className="mt-2 text-sm font-medium text-stone-500 sm:text-base">
                                {formatDateTime(booking.start_time)}
                                {booking.end_time
                                  ? ` – ${formatDateTime(booking.end_time)}`
                                  : ""}
                              </p>

                              <div
                                className={`grid transition-all duration-300 ease-in-out ${
                                  expandedId === booking.id
                                    ? "mt-4 grid-rows-[1fr] opacity-100"
                                    : "grid-rows-[0fr] opacity-0"
                                }`}
                              >
                                <div className="min-h-0 overflow-hidden">
                                  <div
                                    className={`w-full min-w-0 rounded-2xl p-4 text-sm text-stone-700 ${getExpandedPanelClass(
                                      booking.type
                                    )}`}
                                  >
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                      <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                                        {getDetailsHeading(booking.type)}
                                      </h3>

                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            startEditingBooking(booking);
                                          }}
                                          aria-label="Edit booking"
                                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-600 shadow-sm transition hover:bg-white hover:text-stone-900"
                                        >
                                          ✏️
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteBooking(booking.id);
                                          }}
                                          aria-label="Delete booking"
                                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-red-400 shadow-sm transition hover:bg-white hover:text-red-600"
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      {booking.type === "flight" && (
                                        <div className="space-y-4">
                                          <div className="relative overflow-hidden rounded-2xl border border-blue-200/70 bg-white/70 p-4 shadow-sm">
                                            <div className="flex flex-col items-center gap-2 text-center">
                                              <div className="w-full">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                  Departure
                                                </p>
                                                <p className="mt-1 text-base font-semibold text-stone-900">
                                                  {booking.departure_airport || "—"}
                                                </p>
                                                <p className="text-sm text-stone-500">
                                                  {formatDateTime(booking.start_time)}
                                                </p>
                                              </div>

                                              <div className="flex flex-col items-center">
                                                <span className="text-xl">✈️</span>
                                                <div className="mt-1 h-px w-12 bg-blue-200" />
                                              </div>

                                              <div className="w-full">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                  Arrival
                                                </p>
                                                <p className="mt-1 text-base font-semibold text-stone-900">
                                                  {booking.arrival_airport || "—"}
                                                </p>
                                                <p className="text-sm text-stone-500">
                                                  {formatDateTime(booking.end_time)}
                                                </p>
                                              </div>
                                            </div>

                                            <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-blue-100 via-transparent to-blue-100 opacity-50" />
                                          </div>

                                          <div className="grid grid-cols-2 gap-3">
                                            <div className="rounded-2xl bg-white/60 p-3">
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400 whitespace-nowrap overflow-hidden text-ellipsis">
                                                Airline
                                              </p>
                                              <p className="mt-1 text-sm font-semibold text-stone-800">
                                                {booking.airline || "—"}
                                              </p>
                                            </div>

                                            <div className="rounded-2xl bg-white/60 p-3">
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400 whitespace-nowrap overflow-hidden text-ellipsis">
                                                Flight number
                                              </p>
                                              <p className="mt-1 text-sm font-semibold text-stone-800">
                                                {booking.flight_number || "—"}
                                              </p>
                                            </div>

                                            <div className="col-span-2 rounded-2xl bg-white/60 p-3">
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                                                Booking reference
                                              </p>
                                              <p className="mt-1 text-sm font-semibold text-stone-800">
                                                {booking.confirmation_code || "—"}
                                              </p>
                                            </div>
                                          </div>

                                          {booking.notes && (
                                            <div className="rounded-2xl bg-white/60 p-3">
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                                                Notes
                                              </p>
                                              <p className="mt-1 text-sm text-stone-700">
                                                {booking.notes}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {booking.type === "hotel" && (
                                        <div className="space-y-4">
                                          <div className="relative overflow-hidden rounded-2xl border border-orange-200/70 bg-white/70 p-4 shadow-sm">
                                            <div className="flex flex-col items-center gap-2 text-center">
                                              <div className="w-full">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                  Hotel
                                                </p>
                                                <p className="mt-1 text-base font-semibold text-stone-900">
                                                  {booking.hotel_name || booking.title || "—"}
                                                </p>
                                              </div>

                                              <div className="flex flex-col items-center">
                                                <span className="text-xl">🏨</span>
                                                <div className="mt-1 h-px w-12 bg-orange-200" />
                                              </div>

                                              <div className="w-full">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                  Check-in
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-stone-900">
                                                  {formatDateTime(booking.start_time)}
                                                </p>
                                              </div>

                                              <div className="w-full">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                  Check-out
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-stone-900">
                                                  {formatDateTime(booking.end_time)}
                                                </p>
                                              </div>

                                              {booking.address && (
                                                <div className="w-full">
                                                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                    Address
                                                  </p>
                                                  <p className="mt-1 text-sm text-stone-600">
                                                    {booking.address}
                                                  </p>
                                                </div>
                                              )}
                                            </div>

                                            <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-orange-100 via-transparent to-orange-100 opacity-40" />
                                          </div>

                                          {booking.confirmation_code && (
                                            <div className="rounded-2xl bg-white/60 p-3">
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                                                Confirmation code
                                              </p>
                                              <p className="mt-1 text-sm font-semibold text-stone-800">
                                                {booking.confirmation_code}
                                              </p>
                                            </div>
                                          )}

                                          {booking.notes && (
                                            <div className="rounded-2xl bg-white/60 p-3">
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                                                Notes
                                              </p>
                                              <p className="mt-1 text-sm text-stone-700">
                                                {booking.notes}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {booking.type === "transport" && (
                                        <div className="space-y-4">
                                          <div className="relative overflow-hidden rounded-2xl border border-violet-200/70 bg-white/70 p-4 shadow-sm">
                                            <div className="flex flex-col items-center gap-2 text-center">
                                              <div className="w-full">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                  Origin
                                                </p>
                                                <p className="mt-1 text-base font-semibold text-stone-900">
                                                  {booking.origin || "—"}
                                                </p>
                                                <p className="text-sm text-stone-500">
                                                  {formatDateTime(booking.start_time)}
                                                </p>
                                              </div>

                                              <div className="flex flex-col items-center">
                                                <span className="text-xl">
                                                  {booking.title.toLowerCase().includes("bus") ? "🚌" : "🚆"}
                                                </span>
                                                <div className="mt-1 h-px w-12 bg-violet-200" />
                                              </div>

                                              <div className="w-full">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                  Destination
                                                </p>
                                                <p className="mt-1 text-base font-semibold text-stone-900">
                                                  {booking.destination || "—"}
                                                </p>
                                                <p className="text-sm text-stone-500">
                                                  {formatDateTime(booking.end_time)}
                                                </p>
                                              </div>
                                            </div>

                                            <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-violet-100 via-transparent to-violet-100 opacity-50" />
                                          </div>

                                          <div className="grid grid-cols-1 gap-3">
                                            <div className="rounded-2xl bg-white/60 p-3">
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                                                Ticket / booking code
                                              </p>
                                              <p className="mt-1 text-sm font-semibold text-stone-800">
                                                {booking.confirmation_code || "—"}
                                              </p>
                                            </div>
                                          </div>

                                          {booking.notes && (
                                            <div className="rounded-2xl bg-white/60 p-3">
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                                                Notes
                                              </p>
                                              <p className="mt-1 text-sm text-stone-700">{booking.notes}</p>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {booking.type === "dining" && (
                                        <div className="space-y-4">
                                          <div className="relative overflow-hidden rounded-2xl border border-rose-200/70 bg-white/70 p-4 shadow-sm">
                                            <div className="flex flex-col items-center gap-3 text-center">
                                              <div className="w-full">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                  Reservation
                                                </p>
                                                <p className="mt-1 text-base font-semibold text-stone-900">
                                                  {booking.title}
                                                </p>
                                              </div>

                                              <div className="flex flex-col items-center">
                                                <span className="text-xl">🍽️</span>
                                                <div className="mt-1 h-px w-12 bg-rose-200" />
                                              </div>

                                              <div className="w-full">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                  Time
                                                </p>
                                                <p className="mt-1 text-base font-semibold text-stone-900">
                                                  {formatDateTime(booking.start_time)}
                                                </p>
                                              </div>

                                              {booking.address && (
                                                <div className="w-full">
                                                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                    Address
                                                  </p>
                                                  <p className="mt-1 text-sm text-stone-600">
                                                    {booking.address}
                                                  </p>
                                                </div>
                                              )}
                                            </div>

                                            <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-rose-100 via-transparent to-rose-100 opacity-40" />
                                          </div>

                                          {booking.confirmation_code && (
                                            <div className="rounded-2xl bg-white/60 p-3">
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                                                Reservation code
                                              </p>
                                              <p className="mt-1 text-sm font-semibold text-stone-800">
                                                {booking.confirmation_code}
                                              </p>
                                            </div>
                                          )}

                                          {booking.notes && (
                                            <div className="rounded-2xl bg-white/60 p-3">
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                                                Notes
                                              </p>
                                              <p className="mt-1 text-sm text-stone-700">
                                                {booking.notes}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {booking.type === "activity" && (
                                        <>
                                          <DetailRow
                                            label="Schedule"
                                            value={
                                              booking.end_time
                                                ? `${formatDateTime(
                                                    booking.start_time
                                                  )} – ${formatDateTime(
                                                    booking.end_time
                                                  )}`
                                                : formatDateTime(booking.start_time)
                                            }
                                          />
                                          <DetailRow
                                            label="Location"
                                            value={booking.location}
                                          />
                                          <DetailRow
                                            label="Confirmation"
                                            value={booking.confirmation_code}
                                          />
                                          <DetailRow
                                            label="Notes"
                                            value={booking.notes}
                                          />
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}