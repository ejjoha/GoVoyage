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
      className="block overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.985] active:bg-stone-50"
    >
      {trip.image_url ? (
        <div className="relative h-52 w-full overflow-hidden">
          <img
            src={trip.image_url}
            alt={trip.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4">
            <div className="inline-flex rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-stone-700 backdrop-blur-sm">
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
            <h2 className="truncate text-xl font-semibold text-stone-900">
              {trip.title}
            </h2>
            <p className="mt-2 text-sm font-medium text-stone-500">
              {formatTripDateRange(trip.start_date, trip.end_date)}
            </p>
          </div>

          <div className="shrink-0 text-stone-300">→</div>
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

  async function handleCreateTrip() {
    if (!newTitle.trim() || !newDestination.trim() || !newStartDate || !newEndDate) {
      alert("Please fill in Title, Destination, Start date, and End date");
      return;
    }

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

    if (error) {
      console.error(error);
      alert("Failed to create trip");
      return;
    }

    setNewTitle("");
    setNewDestination("");
    setNewImageUrl("");
    setNewStartDate("");
    setNewEndDate("");
    setShowForm(false);

    if (data?.id) {
      router.push(`/trips/${data.id}`);
      return;
    }

    await fetchTrips();
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
      <div className="mb-8 rounded-[2rem] border border-stone-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-7">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          <span>✈️</span>
          <span>Travel Organizer</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          From here to there
        </h1>

        <p className="mt-3 max-w-xl text-stone-500">
          Plan, view, and manage your journeys — from hotel stays and flights to
          dining plans and the little details in between.
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full rounded-2xl bg-rose-500 px-5 py-3.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-rose-600 hover:shadow-lg active:scale-[0.97]"
        >
          <span className="flex items-center justify-center gap-2">
            <span className="text-lg leading-none">＋</span>
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
          </div>

          <button
            onClick={handleCreateTrip}
            className="w-full rounded-2xl bg-green-500 px-5 py-3.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-green-600 hover:shadow-lg active:scale-[0.97]"
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
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">
                    Upcoming trips
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Everything you still have ahead of you.
                  </p>
                </div>

                <div className="shrink-0 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                  {upcomingTrips.length}
                </div>
              </div>

              <div className="space-y-4">
                {upcomingTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </section>
          )}

          {pastTrips.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">
                    Past trips
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Your travel archive and memories.
                  </p>
                </div>

                <div className="shrink-0 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                  {pastTrips.length}
                </div>
              </div>

              <div className="space-y-4">
                {pastTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}