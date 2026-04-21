"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BookingTimeline from "./components/BookingTimeline";
import BookingForm from "./components/BookingForm";
import TripHero from "./components/TripHero";
import ConfirmModal from "./components/ConfirmModal";
import type {
  Trip,
  TripMember,
  Booking,
  BookingType,
  BookingFilter,
} from "./types";
import {
  getStartLabel,
  getFilterLabel,
  formatForDateTimeLocal,
  formatForDateInput,
  formatTripDateRange,
} from "./utils";

type ConfirmState =
  | {
    open: false;
  }
  | {
    open: true;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: "default" | "danger";
    onConfirm: () => void;
  };

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

  const [tripFormError, setTripFormError] = useState("");
  const [travellerFormError, setTravellerFormError] = useState("");

  const [tripMembers, setTripMembers] = useState<TripMember[]>([]);
  const [newTravellerName, setNewTravellerName] = useState("");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeFilter, setActiveFilter] = useState<BookingFilter>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [bookingSuccessMessage, setBookingSuccessMessage] = useState("");
  const [bookingFormError, setBookingFormError] = useState("");

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

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
  });

  const bookingFormRef = useRef<HTMLFormElement | null>(null);

  function openConfirm(config: Omit<Extract<ConfirmState, { open: true }>, "open">) {
    setConfirmState({
      open: true,
      ...config,
    });
  }

  function closeConfirm() {
    setConfirmState({ open: false });
  }

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

  async function fetchTripMembers() {
    const { data, error } = await supabase
      .from("trip_members")
      .select("*")
      .eq("trip_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading trip members:", error);
      setTripMembers([]);
      return;
    }

    setTripMembers((data || []) as TripMember[]);
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
    fetchTripMembers();
  }, [id]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowTripForm(false);
        setShowBookingForm(false);
        closeConfirm();
      }
    }

    if (showTripForm || showBookingForm || confirmState.open) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showTripForm, showBookingForm, confirmState.open]);

  function resetTripFormFromTrip() {
    if (!trip) return;

    setEditTripTitle(trip.title || "");
    setEditTripDestination(trip.destination || "");
    setEditTripImageUrl(trip.image_url || "");
    setEditTripStartDate(formatForDateInput(trip.start_date));
    setEditTripEndDate(formatForDateInput(trip.end_date));
    setNewTravellerName("");
    setTripFormError("");
    setTravellerFormError("");
    setShowTripForm(false);
  }

  async function handleSaveTrip(e: React.FormEvent) {
    e.preventDefault();
    setTripFormError("");

    if (!editTripTitle.trim() || !editTripDestination.trim()) {
      setTripFormError("Please fill in trip title and destination.");
      return;
    }

    if (!editTripStartDate || !editTripEndDate) {
      setTripFormError("Please fill in both start date and end date.");
      return;
    }

    if (editTripEndDate < editTripStartDate) {
      setTripFormError("End date cannot be before start date.");
      return;
    }

    const { error } = await supabase
      .from("trips")
      .update({
        title: editTripTitle.trim(),
        destination: editTripDestination.trim(),
        image_url: editTripImageUrl.trim() || null,
        start_date: editTripStartDate,
        end_date: editTripEndDate,
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating trip:", error);
      setTripFormError("We couldn’t update the trip. Please try again.");
      return;
    }

    await fetchTrip();
    await fetchTripMembers();
    setTripSuccessMessage("Trip updated");
    setTripFormError("");
    setShowTripForm(false);

    setTimeout(() => {
      setTripSuccessMessage("");
    }, 2000);
  }

  async function handleDeleteTripConfirmed() {
    const { error } = await supabase.from("trips").delete().eq("id", id);

    if (error) {
      console.error("Error deleting trip:", error);
      setTripFormError("We couldn’t delete the trip. Please try again.");
      return;
    }

    closeConfirm();
    router.push("/");
  }

  function handleDeleteTrip() {
    openConfirm({
      title: "Delete this trip?",
      description:
        "This will permanently remove the trip and its content. This action cannot be undone.",
      confirmLabel: "Delete trip",
      cancelLabel: "Keep trip",
      tone: "danger",
      onConfirm: handleDeleteTripConfirmed,
    });
  }

  async function handleAddTraveller() {
    const trimmedName = newTravellerName.trim();
    setTravellerFormError("");

    if (!trimmedName) {
      setTravellerFormError("Please enter a traveller name.");
      return;
    }

    const alreadyExists = tripMembers.some(
      (member) => member.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (alreadyExists) {
      setTravellerFormError("That traveller is already on this trip.");
      return;
    }

    const { error } = await supabase.from("trip_members").insert({
      trip_id: id,
      name: trimmedName,
    });

    if (error) {
      console.error("Error adding traveller:", error);
      setTravellerFormError("We couldn’t add that traveller. Please try again.");
      return;
    }

    setNewTravellerName("");
    setTravellerFormError("");
    await fetchTripMembers();
  }

  async function handleDeleteTravellerConfirmed(memberId: number) {
    const { error } = await supabase
      .from("trip_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      console.error("Error deleting traveller:", error);
      setTravellerFormError(
        "We couldn’t remove this traveller. They may still be used in shared costs."
      );
      return;
    }

    closeConfirm();
    await fetchTripMembers();
  }

  function handleDeleteTraveller(memberId: number) {
    openConfirm({
      title: "Remove this traveller?",
      description:
        "This will remove them from the trip. Shared cost entries connected to them may be affected.",
      confirmLabel: "Remove traveller",
      cancelLabel: "Keep traveller",
      tone: "danger",
      onConfirm: () => handleDeleteTravellerConfirmed(memberId),
    });
  }

  async function deleteBookingConfirmed(bookingId: number) {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (error) {
      console.error("Error deleting booking:", error);
      setBookingFormError("We couldn’t delete that booking. Please try again.");
      return;
    }

    closeConfirm();
    await fetchBookings();

    if (expandedId === bookingId) {
      setExpandedId(null);
    }
  }

  function deleteBooking(bookingId: number) {
    openConfirm({
      title: "Delete this booking?",
      description:
        "This will remove the booking from the itinerary permanently.",
      confirmLabel: "Delete booking",
      cancelLabel: "Keep booking",
      tone: "danger",
      onConfirm: () => deleteBookingConfirmed(bookingId),
    });
  }

  function startEditingBooking(booking: Booking) {
    setEditingBookingId(booking.id);
    setShowBookingForm(true);
    setShowTripForm(false);
    setExpandedId(null);
    setBookingFormError("");

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
  }

  function resetBookingForm() {
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
    setBookingFormError("");
    setShowBookingForm(false);
  }

  function openNewBookingForm() {
    resetBookingForm();
    setShowBookingForm(true);
    setShowTripForm(false);
  }

  async function handleSaveBooking(e: React.FormEvent) {
    e.preventDefault();
    setBookingFormError("");

    const resolvedTitle =
      newType === "hotel" ? newHotelName.trim() : newTitle.trim();

    if (!resolvedTitle) {
      setBookingFormError(
        newType === "hotel"
          ? "Please fill in the hotel name."
          : "Please fill in the booking title."
      );
      return;
    }

    if (!newStartTime) {
      setBookingFormError(
        newType === "flight"
          ? "Please fill in the departure date and time."
          : `Please fill in ${getStartLabel(newType).toLowerCase()}.`
      );
      return;
    }

    if (
      newType === "transport" &&
      (!newOrigin.trim() || !newDestinationPoint.trim())
    ) {
      setBookingFormError("Please fill in both origin and destination.");
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
      setBookingFormError("We couldn’t save that booking. Please try again.");
      return;
    }

    const wasEditing = Boolean(editingBookingId);

    await fetchBookings();

    setBookingSuccessMessage(wasEditing ? "Booking updated" : "Booking saved");
    setBookingFormError("");
    resetBookingForm();

    setTimeout(() => {
      setBookingSuccessMessage("");
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

  const tripNights = useMemo(() => {
    if (!trip?.start_date || !trip?.end_date) return 0;

    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }, [trip]);

  const heroStats = useMemo(() => {
    return [
      {
        label: tripMembers.length === 1 ? "traveller" : "travellers",
        value: String(tripMembers.length),
      },
      {
        label: bookings.length === 1 ? "booking" : "bookings",
        value: String(bookings.length),
      },
      {
        label: tripNights === 1 ? "night" : "nights",
        value: String(tripNights),
      },
    ];
  }, [tripMembers.length, bookings.length, tripNights]);

  if (isTripLoading) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <div className="h-6 w-32 animate-pulse rounded-full bg-stone-200" />
          <div className="mt-6 h-10 w-2/3 animate-pulse rounded-2xl bg-stone-200" />
          <div className="mt-3 h-5 w-1/3 animate-pulse rounded-xl bg-stone-200" />
          <div className="mt-6 flex gap-2">
            <div className="h-10 w-24 animate-pulse rounded-full bg-stone-200" />
            <div className="h-10 w-28 animate-pulse rounded-full bg-stone-200" />
            <div className="h-10 w-24 animate-pulse rounded-full bg-stone-200" />
          </div>
        </div>
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
            ✈️
          </div>
          <p className="text-lg font-semibold text-stone-800">Trip not found</p>
          <p className="mt-2 text-sm text-stone-500">
            This trip may have been deleted or the link is incorrect.
          </p>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-6 rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Back to trips
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto w-full max-w-3xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
        <TripHero
          title={trip.title}
          subtitle={formatTripDateRange(trip.start_date, trip.end_date)}
          eyebrow={trip.destination}
          imageUrl={trip.image_url}
          backHref="/"
          onEdit={() => {
            setShowTripForm(true);
            setShowBookingForm(false);
            setTripFormError("");
            setTravellerFormError("");
          }}
          stats={heroStats}
        />

        {(tripSuccessMessage || bookingSuccessMessage) && (
          <div className="mb-5 space-y-3">
            {tripSuccessMessage && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {tripSuccessMessage}
              </div>
            )}

            {bookingSuccessMessage && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {bookingSuccessMessage}
              </div>
            )}
          </div>
        )}

        <section className="mb-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={openNewBookingForm}
            className="flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.97]"
          >
            <span className="text-base">＋</span>
            Add booking
          </button>

          <a
            href={`/trips/${trip.id}/cost-sharing`}
            className="flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-800 shadow-sm transition active:scale-[0.97]"
          >
            <span className="text-base">＋</span>
            Add cost
          </a>
        </section>

        {bookings.length > 0 && (
          <div className="mb-5 w-full">
            <div className="grid w-full grid-cols-4 gap-2 rounded-[1.75rem] bg-stone-100 p-2">
              {filterOptions.map((filter) => {
                const isActive = activeFilter === filter;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    aria-label={getFilterLabel(filter)}
                    className={`flex h-12 items-center justify-center rounded-2xl px-3 text-sm font-medium transition-all duration-200 ${isActive
                      ? "bg-white text-stone-900 shadow-sm ring-1 ring-stone-200"
                      : "bg-transparent text-stone-500 hover:bg-stone-200 hover:text-stone-700"
                      }`}
                  >
                    {filter === "all" && <span>All</span>}
                    {filter === "flight" && <span>Flights</span>}
                    {filter === "hotel" && <span>Hotels</span>}
                    {filter === "plans" && <span>Plans</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {filteredBookings.length === 0 && bookings.length > 0 && (
          <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl shadow-sm">
              🗂️
            </div>
            <p className="text-base font-semibold text-stone-800">
              No {getFilterLabel(activeFilter).toLowerCase()} yet
            </p>
            <p className="mt-2 text-sm text-stone-500">
              Try another filter or add a new booking.
            </p>
          </div>
        )}

        {bookings.length === 0 && (
          <div className="rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
              ✈️
            </div>
            <p className="text-lg font-semibold text-stone-800">
              No bookings yet
            </p>
            <p className="mt-2 text-sm text-stone-500">
              Start building your itinerary by adding your first booking.
            </p>

            <button
              type="button"
              onClick={openNewBookingForm}
              className="mt-6 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              Add first booking
            </button>
          </div>
        )}

        {filteredBookings.length > 0 && (
          <BookingTimeline
            groupedBookings={groupedBookings}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            onEditBooking={startEditingBooking}
            onDeleteBooking={deleteBooking}
          />
        )}
      </main>

      {showTripForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pb-3 pt-20 backdrop-blur-[2px] sm:items-center sm:p-6">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-stone-900">
                  Edit trip
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Update the trip details, dates and travellers.
                </p>
              </div>

              <button
                type="button"
                onClick={resetTripFormFromTrip}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
                aria-label="Close edit trip"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[calc(92vh-80px)] overflow-y-auto px-5 py-5 sm:px-6">
              <form onSubmit={handleSaveTrip} className="space-y-5">
                {tripFormError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {tripFormError}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-stone-700">
                      Trip title
                    </label>
                    <input
                      type="text"
                      value={editTripTitle}
                      onChange={(e) => setEditTripTitle(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-stone-700">
                      Destination
                    </label>
                    <input
                      type="text"
                      value={editTripDestination}
                      onChange={(e) => setEditTripDestination(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-stone-700">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={editTripImageUrl}
                      onChange={(e) => setEditTripImageUrl(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-stone-700">
                        Start date
                      </label>
                      <input
                        type="date"
                        value={editTripStartDate}
                        onChange={(e) => setEditTripStartDate(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-stone-700">
                        End date
                      </label>
                      <input
                        type="date"
                        value={editTripEndDate}
                        onChange={(e) => setEditTripEndDate(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900">
                      Travellers
                    </h3>
                    <p className="mt-1 text-sm text-stone-500">
                      Add or remove the people on this trip.
                    </p>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <input
                      type="text"
                      placeholder="Traveller name"
                      value={newTravellerName}
                      onChange={(e) => setNewTravellerName(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                    />

                    <button
                      type="button"
                      onClick={handleAddTraveller}
                      className="shrink-0 rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
                    >
                      Add
                    </button>
                  </div>

                  {travellerFormError && (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {travellerFormError}
                    </div>
                  )}

                  {tripMembers.length === 0 ? (
                    <p className="mt-3 text-sm text-stone-500">
                      No travellers added yet.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-2">
                      {tripMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-3 text-sm text-stone-800"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-stone-700">
                              {member.name
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <span>{member.name}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteTraveller(member.id)}
                            className="rounded-full bg-red-50 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-100"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-4">
                  <h3 className="text-sm font-semibold text-red-700">
                    Danger zone
                  </h3>
                  <p className="mt-1 text-sm text-red-600/80">
                    Deleting the trip will remove it permanently.
                  </p>

                  <button
                    type="button"
                    onClick={handleDeleteTrip}
                    className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-100"
                  >
                    Delete trip
                  </button>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-stone-200 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={resetTripFormFromTrip}
                    className="rounded-xl bg-stone-100 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showBookingForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pb-3 pt-14 backdrop-blur-[2px] sm:items-center sm:p-6">
          <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-stone-900">
                  {editingBookingId ? "Edit booking" : "Add booking"}
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Add the details and keep your itinerary up to date.
                </p>
              </div>

              <button
                type="button"
                onClick={resetBookingForm}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
                aria-label="Close booking form"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
              {bookingFormError && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {bookingFormError}
                </div>
              )}

              <BookingForm
                bookingFormRef={bookingFormRef}
                editingBookingId={editingBookingId}
                newTitle={newTitle}
                setNewTitle={setNewTitle}
                newType={newType}
                setNewType={setNewType}
                newStartTime={newStartTime}
                setNewStartTime={setNewStartTime}
                newEndTime={newEndTime}
                setNewEndTime={setNewEndTime}
                newLocation={newLocation}
                setNewLocation={setNewLocation}
                newConfirmation={newConfirmation}
                setNewConfirmation={setNewConfirmation}
                newNotes={newNotes}
                setNewNotes={setNewNotes}
                newAirline={newAirline}
                setNewAirline={setNewAirline}
                newFlightNumber={newFlightNumber}
                setNewFlightNumber={setNewFlightNumber}
                newDeparture={newDeparture}
                setNewDeparture={setNewDeparture}
                newArrival={newArrival}
                setNewArrival={setNewArrival}
                newHotelName={newHotelName}
                setNewHotelName={setNewHotelName}
                newAddress={newAddress}
                setNewAddress={setNewAddress}
                newOrigin={newOrigin}
                setNewOrigin={setNewOrigin}
                newDestinationPoint={newDestinationPoint}
                setNewDestinationPoint={setNewDestinationPoint}
                onSubmit={handleSaveBooking}
                onCancel={resetBookingForm}
              />
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.open ? confirmState.title : ""}
        description={confirmState.open ? confirmState.description : ""}
        confirmLabel={confirmState.open ? confirmState.confirmLabel : "Confirm"}
        cancelLabel={confirmState.open ? confirmState.cancelLabel : "Cancel"}
        tone={confirmState.open ? confirmState.tone : "default"}
        onCancel={closeConfirm}
        onConfirm={() => {
          if (confirmState.open) {
            confirmState.onConfirm();
          }
        }}
      />
    </>
  );
}