"use client";

import CreateTripModal from "@/components/CreateTripModal";
import { supabase } from "@/lib/supabase";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getDestinationImage } from "@/lib/pexels";
import { TripCard } from "@/components/TripCard";
import { PastTripCard } from "@/components/PastTripCard";
import { TripCardSkeleton } from "@/components/TripCardSkeleton";
import {
  addTripMembers,
  createTrip,
  getPendingTripInvites,
  getTrips,
  type PendingTripInvite,
} from "@/services/trips";
import { createTripInvite } from "@/app/trips/[id]/api";
import type { Trip } from "@/types/trip";
import { PastTripsCarousel } from "@/components/PastTripsCarousel";
import ScrollToTopButton from "./trips/[id]/components/ScrollToTopButton";
import { motion } from "framer-motion";

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

function HomeHeroSkeleton() {
  return (
    <section className="relative mb-5 overflow-hidden rounded-[2rem] border border-stone-200/60 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-5">
      <div className="-mx-4 -mt-4 mb-4 h-49 animate-pulse rounded-t-[2rem] bg-stone-200 sm:-mx-5 sm:-mt-5" />

      <div className="mt-3 space-y-2">
        <div className="h-4 w-40 animate-pulse rounded-full bg-stone-200" />
        <div className="h-4 w-56 animate-pulse rounded-full bg-stone-200" />
      </div>
    </section>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [userDisplayName, setUserDisplayName] = useState("");
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingInvites, setPendingInvites] = useState<PendingTripInvite[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [createTripError, setCreateTripError] = useState("");
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const createTripErrorRef = useRef<HTMLDivElement | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDestination, setNewDestination] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
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

  async function fetchPendingInvites() {
    try {
      const data = await getPendingTripInvites();
      setPendingInvites(data as unknown as PendingTripInvite[]);
    } catch (err) {
      console.error("Unexpected error loading pending invites:", err);
      setPendingInvites([]);
    }
  }

  async function handleAcceptPendingInvite(inviteId: number) {
    try {
      const { error } = await supabase.rpc("accept_trip_invite", {
        invite_id: inviteId,
      });

      if (error) {
        throw new Error(error.message);
      }

      localStorage.removeItem("cached-trips");

      await fetchTrips();
      await fetchPendingInvites();
    } catch (err) {
      console.error("Error accepting pending invite:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Could not accept invitation."
      );
    }
  }

  async function handleDeclinePendingInvite(inviteId: number) {
    try {
      const { error } = await supabase.rpc("decline_trip_invite", {
        invite_id: inviteId,
      });

      if (error) {
        throw new Error(error.message);
      }

      await fetchPendingInvites();
    } catch (err) {
      console.error("Error declining pending invite:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Could not decline invitation."
      );
    }
  }

  useEffect(() => {
    async function loadUserAndTrips() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("User is not signed in:", error);
        setIsLoading(false);
        router.replace("/login");
        return;
      }

      setUserEmail(user.email || "Unknown user");
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();

      setUserDisplayName(profile?.display_name || "");

      await fetchTrips();
      await fetchPendingInvites();
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

  async function handleCreateTrip(event?: React.FormEvent) {
    event?.preventDefault();

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

    try {
      const destinationImageUrl = await getDestinationImage(newDestination.trim());

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to invite someone.");
      }

      const data = await createTrip({
        title: newTitle.trim(),
        destination: newDestination.trim(),
        image_url: destinationImageUrl || undefined,
        start_date: newStartDate,
        end_date: newEndDate,
        currencies: selectedCurrencies,
      });

      const travellersToSave = newTravellers.map((t) => ({
        name: t.name,
        user_id: null,
      }));

      if (travellersToSave.length > 0) {
        try {
          await addTripMembers(data.id, travellersToSave);
        } catch (err) {
          console.error("Error saving travellers:", err);
          alert("Trip created, but travellers could not be saved");
        }
      }

      const invite = inviteEmail.trim().toLowerCase();

      if (invite) {
        const { error: inviteError } = await createTripInvite(
          data.id,
          invite,
          invite,
          user.id,
          userDisplayName || user.email || "Someone"
        );

        if (inviteError) {
          console.error("Error saving trip invite:", inviteError);
        } else {
          const emailResponse = await fetch("/api/send-trip-invite", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: invite,
              tripTitle: newTitle.trim() || "a trip",
              inviterName: "Someone",
            }),
          });

          if (!emailResponse.ok) {
            console.error(
              "Invite saved, but the email could not be sent."
            );
          }
        }
      }

      setNewTitle("");
      setNewDestination("");
      setNewStartDate("");
      setNewEndDate("");
      setTravellerName("");
      setNewTravellers([]);
      setInviteEmail("");
      setShowForm(false);

      setIsCreatingTrip(false);

      router.push(`/trips/${data.id}?setup=1`);
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

  const hasAnyTrips = trips.length > 0 || pendingInvites.length > 0;

  return (
    <main className="min-h-dvh overflow-x-clip pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
      <div className="mx-auto w-full max-w-2xl min-w-0 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:px-6 sm:pt-8">
        {isLoading ? (
          <HomeHeroSkeleton />
        ) : (
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
                      onClick={() => {
                        setShowAccountMenu(false);
                        router.push("/account");
                      }}
                      className="mb-2 flex w-full items-center justify-center rounded-2xl bg-stone-100 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-200 active:scale-[0.98]"
                    >
                      Account settings
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        await supabase.auth.signOut();
                        setUserEmail("");
                        setUserDisplayName("");
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
        )}

        {!isOnline && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            You’re offline. You can view cached app content, but updates may not sync until your connection returns.
          </div>
        )}

        <div className="mb-8 min-w-0 overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setCreateTripError("");
            }}
            className="group w-full min-w-0 rounded-2xl bg-rose-500 px-5 py-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(244,63,94,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-600 active:translate-y-0 active:scale-[0.985]"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-lg leading-none transition-transform duration-200 group-hover:rotate-90">
                ＋
              </span>
              Create new trip
            </span>
          </button>
        </div>

        {showForm && (
          <CreateTripModal
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            newDestination={newDestination}
            setNewDestination={setNewDestination}
            newStartDate={newStartDate}
            setNewStartDate={setNewStartDate}
            newEndDate={newEndDate}
            setNewEndDate={setNewEndDate}
            createTripError={createTripError}
            isCreatingTrip={isCreatingTrip}
            onClose={() => setShowForm(false)}
            onCreateTrip={handleCreateTrip}
          />
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
            {pendingInvites.length > 0 && (
              <section className="space-y-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">
                      Invitations
                    </p>

                    <h2 className="text-2xl font-semibold tracking-[-0.02em] text-stone-900">
                      Pending invitations
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-stone-500">
                      Trips you’ve been invited to join.
                    </p>
                  </div>

                  <div className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm font-semibold text-stone-700 shadow-sm">
                    {pendingInvites.length}
                  </div>
                </div>

                <div className="space-y-3">
                  {pendingInvites.map((invite) => {
                    const trip = Array.isArray(invite.trips)
                      ? invite.trips[0]
                      : invite.trips;

                    if (!trip) return null;

                    return (
                      <div
                        key={invite.id}
                        className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 shadow-sm"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                          Trip invitation
                        </p>

                        <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-stone-900">
                          {trip.title}
                        </h3>

                        <p className="mt-1 text-sm text-stone-600">
                          {trip.destination}
                        </p>

                        <p className="mt-3 text-sm text-amber-800">
                          {invite.inviter_name
                            ? `${invite.inviter_name} invited you to this trip.`
                            : "You were invited to this trip."}
                        </p>

                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => handleAcceptPendingInvite(invite.id)}
                            className="rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                          >
                            Accept invitation
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeclinePendingInvite(invite.id)}
                            className="rounded-2xl border border-amber-300 bg-white px-5 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
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
                  {upcomingTrips.map((trip, index) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: index * 0.06,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <TripCard trip={trip} />
                    </motion.div>
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
      </div>
      <ScrollToTopButton />
    </main>
  );
}