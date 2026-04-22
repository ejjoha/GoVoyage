"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Trip = {
  id: number;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  image_url?: string;
};

type NewTraveller = {
  id: number;
  name: string;
};

function formatTripDateRange(start?: string, end?: string) {
  if (!start || !end) return "";

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "";
  }

  const startDay = startDate.getDate();
  const endDay = endDate.getDate();

  const startMonth = startDate.toLocaleDateString("en-GB", { month: "short" });
  const endMonth = endDate.toLocaleDateString("en-GB", { month: "short" });

  if (startMonth === endMonth) {
    return `${startDay}–${endDay} ${startMonth}`;
  }

  return `${startDay} ${startMonth} – ${endDay} ${endMonth}`;
}

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function TripCard({ trip }: { trip: Trip }) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group block overflow-hidden rounded-[2rem] border border-stone-200/70 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] active:scale-[0.985]"
    >
      {trip.image_url ? (
        <div className="relative h-56 w-full overflow-hidden">
          <img
            src={trip.image_url}
            alt={trip.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div className="inline-flex rounded-full border border-white/40 bg-white/85 px-3 py-1.5 text-xs font-semibold text-stone-700 backdrop-blur-sm">
              {trip.destination}
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-stone-700 shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:translate-x-0.5">
              →
            </div>
          </div>
        </div>
      ) : (
        <div className="border-b border-stone-100 bg-gradient-to-r from-stone-50 to-stone-100/70 px-5 py-5">
          <div className="inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 shadow-sm">
            {trip.destination}
          </div>
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-[1.35rem] font-semibold tracking-[-0.02em] text-stone-900">
              {trip.title}
            </h2>

            <p className="mt-2 text-sm font-medium text-stone-500">
              {formatTripDateRange(trip.start_date, trip.end_date)}
            </p>
          </div>

          {!trip.image_url && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-400 transition-colors duration-200 group-hover:bg-stone-900 group-hover:text-white">
              →
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function PastTripCard({ trip }: { trip: Trip }) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group block overflow-hidden rounded-[1.75rem] border border-stone-200/60 bg-white/90 shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] active:scale-[0.985]"
    >
      {trip.image_url ? (
        <div className="relative h-44 w-full overflow-hidden">
          <img
            src={trip.image_url}
            alt={trip.title}
            className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
            <div className="inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-stone-700 backdrop-blur-sm">
              {trip.destination}
            </div>
          </div>
        </div>
      ) : (
        <div className="border-b border-stone-100 bg-stone-50 px-5 py-4">
          <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600 shadow-sm">
            {trip.destination}
          </div>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-medium text-stone-800">
              {trip.title}
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              {formatTripDateRange(trip.start_date, trip.end_date)}
            </p>
          </div>

          <div className="shrink-0 text-stone-300 transition-colors group-hover:text-stone-500">
            →
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const router = useRouter();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDestination, setNewDestination] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [travellerName, setTravellerName] = useState("");
  const [newTravellers, setNewTravellers] = useState<NewTraveller[]>([]);

  async function fetchTrips() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) {
        console.error("Error loading trips:", error);
        setErrorMessage(error.message || "Could not load trips");
        setTrips([]);
        return;
      }

      setTrips((data || []) as Trip[]);
    } catch (err) {
      console.error("Unexpected error loading trips:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Unexpected error while loading trips";

      setErrorMessage(message);
      setTrips([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchTrips();
  }, []);

  function handleAddTraveller() {
    if (!travellerName.trim()) {
      alert("Please enter a traveller name");
      return;
    }
    if (
      newTravellers.some(
        (traveller) =>
          traveller.name.trim().toLowerCase() === travellerName.trim().toLowerCase()
      )
    ) {
      alert("That traveller is already added");
      return;
    }

    const newTraveller: NewTraveller = {
      id: Date.now(),
      name: travellerName.trim(),
    };

    setNewTravellers((current) => [...current, newTraveller]);
    setTravellerName("");
  }

  function handleRemoveTraveller(travellerId: number) {
    setNewTravellers((current) =>
      current.filter((traveller) => traveller.id !== travellerId)
    );
  }

  async function handleCreateTrip() {
    if (!newTitle.trim() || !newDestination.trim() || !newStartDate || !newEndDate) {
      alert("Please fill in Title, Destination, Start date, and End date");
      return;
    }

    if (newEndDate < newStartDate) {
      alert("End date cannot be before start date");
      return;
    }
    if (newTravellers.length === 0) {
      alert("Please add at least one traveller");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("trips")
        .insert({
          title: newTitle.trim(),
          destination: newDestination.trim(),
          image_url: newImageUrl.trim() || null,
          start_date: newStartDate,
          end_date: newEndDate,
        })
        .select()
        .single();

      if (error || !data) {
        console.error(error);
        alert("Failed to create trip");
        return;
      }

      if (newTravellers.length > 0) {
        const travellerRows = newTravellers.map((traveller) => ({
          trip_id: data.id,
          name: traveller.name,
        }));

        const { error: memberError } = await supabase
          .from("trip_members")
          .insert(travellerRows);

        if (memberError) {
          console.error("Error saving travellers:", memberError);
          alert("Trip created, but travellers could not be saved");
        }
      }

      setNewTitle("");
      setNewDestination("");
      setNewImageUrl("");
      setNewStartDate("");
      setNewEndDate("");
      setTravellerName("");
      setNewTravellers([]);
      setShowForm(false);

      router.push(`/trips/${data.id}`);
    } catch (err) {
      console.error("Unexpected error creating trip:", err);
      alert("Failed to create trip");
    }
  }

  const { upcomingTrips, pastTrips } = useMemo(() => {
    const todayString = getTodayDateString();

    const upcoming = trips.filter((trip) => trip.end_date >= todayString);
    const past = trips.filter((trip) => trip.end_date < todayString);

    return {
      upcomingTrips: upcoming,
      pastTrips: past.sort((a, b) => b.end_date.localeCompare(a.end_date)),
    };
  }, [trips]);

  const hasAnyTrips = trips.length > 0;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <section className="mb-5 overflow-hidden rounded-[2rem] border border-stone-200/60 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-5">

        <div className="flex justify-center">
          <img
            src="/logos/app-hero-logo.png"
            alt="Travel Organizer"
            className="h-48 w-auto sm:h-64"
          />
        </div>

        <div className="mt-3 max-w-md">
          <p className="text-sm text-stone-500 sm:text-base">
            Plan, view, and manage every part of your trip —
          </p>
          <p className="text-sm text-stone-500 sm:text-base">
            from flights and stays to dining plans and the details in between.
          </p>
        </div>

      </section>

      <div className="mb-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="group w-full rounded-2xl bg-rose-500 px-5 py-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(244,63,94,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-600 active:translate-y-0 active:scale-[0.985]"
        >
          <span className="flex items-center justify-center gap-2">
            <span className="text-lg leading-none transition-transform duration-200 group-hover:rotate-90">
              ＋
            </span>
            {showForm ? "Close trip form" : "Create new trip"}
          </span>
        </button>
      </div>

      {showForm && (
        <div className="mb-6 space-y-4 rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">
              Create new trip
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Start with the basics and build the details from there.
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Trip title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
            />

            <input
              type="text"
              placeholder="Destination"
              value={newDestination}
              onChange={(e) => setNewDestination(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
            />

            <input
              type="text"
              placeholder="Image URL (optional)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
              />

              <input
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
              />
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-900">
                  Travellers
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  Add the people going on this trip.
                </p>
              </div>

              <div className="mt-3 flex gap-3">
                <input
                  type="text"
                  placeholder="Traveller name"
                  value={travellerName}
                  onChange={(e) => setTravellerName(e.target.value)}
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

              {newTravellers.length === 0 ? (
                <p className="mt-3 text-sm text-stone-500">
                  No travellers added yet.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {newTravellers.map((traveller) => (
                    <div
                      key={traveller.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-3 text-sm text-stone-800"
                    >
                      <span>{traveller.name}</span>

                      <button
                        type="button"
                        onClick={() => handleRemoveTraveller(traveller.id)}
                        className="rounded-full bg-red-50 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleCreateTrip}
            className="w-full rounded-2xl bg-rose-500 px-5 py-3.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-rose-600 hover:shadow-lg active:scale-[0.97]"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-lg">✓</span>
              Save trip
            </span>
          </button>
        </div>
      )}

      {isLoading && (
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6 text-stone-500 shadow-sm">
          Loading trips...
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && !hasAnyTrips && (
        <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-stone-50 p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
            ✈️
          </div>
          <p className="text-lg font-medium text-stone-700">No trips yet</p>
          <p className="mt-2 text-sm text-stone-500">
            Create your first trip to start planning.
          </p>
        </div>
      )}

      {!isLoading && !errorMessage && hasAnyTrips && (
        <div className="space-y-8">
          {upcomingTrips.length > 0 && (
            <section className="space-y-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Planned journeys
                  </div>

                  <h2 className="text-2xl font-semibold tracking-[-0.02em] text-stone-900">
                    Upcoming trips
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    Everything you still have ahead of you.
                  </p>
                </div>

                <div className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm font-semibold text-stone-700 shadow-sm">
                  {upcomingTrips.length}
                </div>
              </div>

              <div className="space-y-5">
                {upcomingTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </section>
          )}

          {pastTrips.length > 0 && (
            <section className="space-y-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Travel archive
                  </div>

                  <h2 className="text-2xl font-semibold tracking-[-0.02em] text-stone-900">
                    Past trips
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    Places you’ve been and moments you’ve captured.
                  </p>
                </div>

                <div className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm font-semibold text-stone-700 shadow-sm">
                  {pastTrips.length}
                </div>
              </div>

              <div className="space-y-4 opacity-90">
                {pastTrips.map((trip) => (
                  <PastTripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}