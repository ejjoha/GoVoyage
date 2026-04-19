"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BookingTimeline from "./components/BookingTimeline";
import BookingForm from "./components/BookingForm";
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

  const [tripMembers, setTripMembers] = useState<TripMember[]>([]);
  const [newTravellerName, setNewTravellerName] = useState("");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeFilter, setActiveFilter] = useState<BookingFilter>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [bookingSuccessMessage, setBookingSuccessMessage] = useState("");

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

  function resetTripFormFromTrip() {
    if (!trip) return;

    setEditTripTitle(trip.title || "");
    setEditTripDestination(trip.destination || "");
    setEditTripImageUrl(trip.image_url || "");
    setEditTripStartDate(formatForDateInput(trip.start_date));
    setEditTripEndDate(formatForDateInput(trip.end_date));
    setNewTravellerName("");
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

    if (editTripEndDate < editTripStartDate) {
      alert("End date cannot be before start date");
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
      alert("Failed to update trip");
      return;
    }

    await fetchTrip();
    await fetchTripMembers();
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

  async function handleAddTraveller() {
    const trimmedName = newTravellerName.trim();

    if (!trimmedName) {
      alert("Please enter a traveller name");
      return;
    }

    const alreadyExists = tripMembers.some(
      (member) => member.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (alreadyExists) {
      alert("That traveller is already on this trip");
      return;
    }

    const { error } = await supabase.from("trip_members").insert({
      trip_id: id,
      name: trimmedName,
    });

    if (error) {
      console.error("Error adding traveller:", error);
      alert("Could not add traveller");
      return;
    }

    setNewTravellerName("");
    await fetchTripMembers();
  }

  async function handleDeleteTraveller(memberId: number) {
    const shouldDelete = confirm("Delete this traveller?");
    if (!shouldDelete) return;

    const { error } = await supabase
      .from("trip_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      console.error("Error deleting traveller:", error);
      alert(
        "Could not delete traveller. They may still be used in shared costs."
      );
      return;
    }

    await fetchTripMembers();
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
    setShowBookingForm(true);
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
    setShowBookingForm(false);
  }

  function openNewBookingForm() {
    resetBookingForm();
    setShowBookingForm(true);
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

    if (
      newType === "transport" &&
      (!newOrigin.trim() || !newDestinationPoint.trim())
    ) {
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

    setBookingSuccessMessage(wasEditing ? "Booking updated" : "Booking saved");
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

      {!showBookingForm && (
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-stone-600 shadow-sm backdrop-blur transition-all duration-200 hover:border-stone-300 hover:bg-white hover:text-stone-800 hover:shadow-md active:scale-[0.98]"
        >
          <span className="text-base leading-none">←</span>
          <span>Back to trips</span>
        </Link>
      )}

      {!showBookingForm && (
        <div className="mb-5 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
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

          <Link
            href={`/trips/${trip.id}/cost-sharing`}
            className="w-full rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-lg">💸</span>
              Shared costs
            </span>
          </Link>
        </div>
      )}

      {!showBookingForm && bookings.length > 0 && (
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
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
          />

          <input
            type="text"
            placeholder="Destination"
            value={editTripDestination}
            onChange={(e) => setEditTripDestination(e.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
          />

          <input
            type="text"
            placeholder="Image URL"
            value={editTripImageUrl}
            onChange={(e) => setEditTripImageUrl(e.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">
              Start date
            </label>
            <input
              type="date"
              value={editTripStartDate}
              onChange={(e) => setEditTripStartDate(e.target.value)}
              className="box-border min-w-0 w-full rounded-xl border border-stone-300 bg-white px-2.5 py-3 text-sm text-stone-800"
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
              className="box-border min-w-0 w-full rounded-xl border border-stone-300 bg-white px-2.5 py-3 text-sm text-stone-800"
            />
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                Travellers
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                Add or remove the people on this trip.
              </p>
            </div>

            <div className="mt-3 flex gap-3">
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

            {tripMembers.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">
                No travellers added yet.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {tripMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-3 text-sm text-stone-800"
                  >
                    <span>{member.name}</span>

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

      {bookingSuccessMessage && (
        <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {bookingSuccessMessage}
        </div>
      )}

      {showBookingForm && (
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
      )}

      {filteredBookings.length === 0 &&
        bookings.length > 0 &&
        !showBookingForm && (
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
        <BookingTimeline
          groupedBookings={groupedBookings}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          onEditBooking={startEditingBooking}
          onDeleteBooking={deleteBooking}
        />
      )}
    </main>
  );
}