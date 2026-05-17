"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TripCard } from "@/components/TripCard";
import { PastTripCard } from "@/components/PastTripCard";
import { TripCardSkeleton } from "@/components/TripCardSkeleton";
import { addTripMembers, createTrip, getTrips } from "@/services/trips";
import { createTripInvite } from "@/app/trips/[id]/api";
import type { Trip } from "@/types/trip";
import { PastTripsCarousel } from "@/components/PastTripsCarousel";

type NewTraveller = {
  id: number;
  name: string;
};

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function HomePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [createTripError, setCreateTripError] = useState("");
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const createTripErrorRef = useRef<HTMLDivElement | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDestination, setNewDestination] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [travellerName, setTravellerName] = useState("");
  const [newTravellers, setNewTravellers] = useState<NewTraveller[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([
    "NOK",
    "EUR",
    "GBP",
  ]);
  const [customCurrency, setCustomCurrency] = useState("");

  async function fetchTrips() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getTrips();

      setTrips(data as Trip[]);

      localStorage.setItem(
        "cached-trips",
        JSON.stringify(data)
      );
    } catch (err) {
      console.error("Unexpected error loading trips:", err);

      const cachedTrips = localStorage.getItem("cached-trips");

      if (cachedTrips) {
        setTrips(JSON.parse(cachedTrips));
      } else {
        setTrips([]);
      }

      const message =
        err instanceof Error
          ? err.message
          : "Unexpected error while loading trips";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function loadUserAndTrips() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error loading user:", error);
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      if (!user) {
        setIsLoading(false);
        router.push("/login");
        return;
      }

      setUserEmail(user.email || "Unknown user");

      await fetchTrips();
    }

    loadUserAndTrips();
  }, []);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!createTripError) return;

    createTripErrorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [createTripError]);

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
    setCreateTripError("");
    setIsCreatingTrip(true);
    if (!newTitle.trim() || !newDestination.trim() || !newStartDate || !newEndDate) {
      setCreateTripError("Please fill in title, destination, start date, and end date.");
      setIsCreatingTrip(false);
      return;
    }
    if (newEndDate < newStartDate) {
      setCreateTripError("End date cannot be before start date.");
      setIsCreatingTrip(false);
      return;
    }
    if (newTravellers.length === 0) {
      setCreateTripError("Please add at least one traveller.");
      setIsCreatingTrip(false);
      return;
    }

    try {
      const data = await createTrip({
        title: newTitle.trim(),
        destination: newDestination.trim(),
        image_url: newImageUrl.trim() || undefined,
        start_date: newStartDate,
        end_date: newEndDate,
        currencies: selectedCurrencies,
      });

      try {
        await addTripMembers(
          data.id,
          newTravellers.map((t) => ({ name: t.name }))
        );
      } catch (err) {
        console.error("Error saving travellers:", err);
        alert("Trip created, but travellers could not be saved");
      }

      const invite = inviteEmail.trim().toLowerCase();

      if (invite) {
        const { error: inviteError } = await createTripInvite(data.id, invite);

        if (inviteError) {
          console.error("Error saving trip invite:", inviteError);
        }
      }

      setNewTitle("");
      setNewDestination("");
      setNewImageUrl("");
      setNewStartDate("");
      setNewEndDate("");
      setTravellerName("");
      setNewTravellers([]);
      setInviteEmail("");
      setShowForm(false);

      setIsCreatingTrip(false);

      router.push(`/trips/${data.id}`);
    } catch (err) {
      console.error("Unexpected error creating trip:", err);
      setCreateTripError("Failed to create trip.");
      setIsCreatingTrip(false);
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
    <main className="mx-auto min-h-screen max-w-2xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <section className="relative mb-5 overflow-visible rounded-[2rem] border border-stone-200/60 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-5">
        <div className="absolute right-4 top-4 z-10">
          <div className="relative group">
            <button
              type="button"
              onClick={() => setShowAccountMenu((current) => !current)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
            >
              {userEmail ? userEmail.charAt(0).toUpperCase() : "?"}
            </button>

            {showAccountMenu && (
              <div className="absolute right-0 top-12 w-[280px] rounded-[1.75rem] border border-stone-200/70 bg-white/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <p className="text-sm font-medium text-stone-500">
                  Signed in as
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-500 text-lg font-semibold text-white shadow-sm">
                    {userEmail ? userEmail.charAt(0).toUpperCase() : "?"}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-900">
                      {userEmail || "Unknown user"}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      GoVoyage account
                    </p>
                  </div>
                </div>

                <div className="my-4 h-px bg-stone-200" />

                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setUserEmail("");
                    window.location.href = "/login";
                  }}
                  className="flex w-full items-center justify-center rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 active:scale-[0.98]"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="-mx-4 -mt-4 mb-4 sm:-mx-5 sm:-mt-5">
          <img
            src="/logos/app-hero-logo.png"
            alt="Travel Organizer"
            className="h-auto w-full rounded-t-[2rem] object-cover"
          />
        </div>

        <div className="mt-3 max-w-md">
          <p className="text-sm text-stone-500 sm:text-base">
            Plan it. See it. Enjoy it.
          </p>
          <p className="text-sm text-stone-500 sm:text-base">
            Where every journey comes together.
          </p>
        </div>
      </section>

      {!isOnline && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          You’re offline. You can view cached app content, but updates may not sync until your connection returns.
        </div>
      )}

      <div className="mb-8">
        <button
          onClick={() => {
            setShowForm((current) => !current);
            setCreateTripError("");
          }}
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
            {createTripError && (
              <div
                ref={createTripErrorRef}
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {createTripError}
              </div>
            )}
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
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-stone-700">
                  Start date
                </label>
                <input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-stone-700">
                  End date
                </label>
                <input
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                />
              </div>
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
                      <span className="min-w-0 flex-1 truncate">
                        {traveller.name}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveTraveller(traveller.id)}
                        className="shrink-0 rounded-full bg-red-50 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <h3 className="text-sm font-semibold text-stone-900">
              Invite by email
            </h3>

            <p className="mt-1 text-sm text-stone-500">
              Optionally invite someone to access and edit this trip.
            </p>

            <input
              type="email"
              placeholder="friend@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="mt-3 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
            />
          </div>

          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                Trip currencies
              </h3>

              <p className="mt-1 text-sm text-stone-500">
                Choose which currencies are available when adding expenses.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCurrencies.map((currency) => (
                <button
                  key={currency}
                  type="button"
                  onClick={() =>
                    setSelectedCurrencies((current) =>
                      current.filter((item) => item !== currency)
                    )
                  }
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm"
                >
                  {currency} ×
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                "NOK",
                "SEK",
                "DKK",
                "EUR",
                "USD",
                "GBP",
                "THB",
                "IDR",
                "JPY",
              ].map((currency) => {
                const isSelected = selectedCurrencies.includes(currency);

                return (
                  <button
                    key={currency}
                    type="button"
                    disabled={isSelected}
                    onClick={() =>
                      setSelectedCurrencies((current) => [
                        ...current,
                        currency,
                      ])
                    }
                    className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${isSelected
                      ? "bg-stone-200 text-stone-400"
                      : "bg-white text-stone-800 shadow-sm hover:bg-stone-100"
                      }`}
                  >
                    {currency}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Custom currency"
                value={customCurrency}
                onChange={(e) =>
                  setCustomCurrency(e.target.value.toUpperCase())
                }
                maxLength={3}
                className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold uppercase text-stone-800 outline-none transition focus:border-rose-300"
              />

              <button
                type="button"
                onClick={() => {
                  const trimmed = customCurrency.trim();

                  if (
                    trimmed.length !== 3 ||
                    selectedCurrencies.includes(trimmed)
                  ) {
                    return;
                  }

                  setSelectedCurrencies((current) => [
                    ...current,
                    trimmed,
                  ]);

                  setCustomCurrency("");
                }}
                className="rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 active:scale-[0.98]"
              >
                Add
              </button>
            </div>
          </div>

          <button
            onClick={handleCreateTrip}
            disabled={isCreatingTrip}
            className="w-full rounded-2xl bg-rose-500 px-5 py-3.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-rose-600 hover:shadow-lg active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-lg">
                {isCreatingTrip ? "…" : "✓"}
              </span>

              {isCreatingTrip ? "Creating trip..." : "Save trip"}
            </span>
          </button>
        </div>
      )}

      {isLoading && (
        <div className="space-y-5">
          <TripCardSkeleton />
          <TripCardSkeleton />
          <TripCardSkeleton />
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
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">
                    Planned journeys
                  </p>

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
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">
                    Travel archive
                  </p>

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

              <div className="max-w-full overflow-hidden opacity-90">
                <PastTripsCarousel trips={pastTrips} />
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}