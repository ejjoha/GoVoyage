"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import TripPeopleList from "./components/TripPeopleList";
import InviteFriendsSheet from "./components/InviteFriendsSheet";
import TripCurrenciesSheet from "./components/TripCurrenciesSheet";
import { useTripMembers } from "./hooks/useTripMembers";
import { useTripBookings } from "./hooks/useTripBookings";
import Link from "next/link";
import ScrollToTopButton from "./components/ScrollToTopButton";
import TripSetupSheet from "./components/TripSetupSheet";

import { useTripData } from "./hooks/useTripData";

import {
  createBooking,
  createTripInvite,
  deleteBookingById,
  deleteTrip,
  deleteTripInvite,
  leaveTripAsCollaborator,
  updateBooking,
  updateTrip,
  removeTripCollaborator,
  transferTripOwnership,
  type TripInvite,
} from "./api";

import BookingTimeline from "./components/BookingTimeline";
import BookingForm from "./components/BookingForm";
import TripHero from "./components/TripHero";
import EditTripModal from "./components/EditTripModal";
import ConfirmModal from "./components/ConfirmModal";
import type {
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
  const searchParams = useSearchParams();
  const id = Number(params.id);

  const [showTripForm, setShowTripForm] = useState(false);
  const [tripSuccessMessage, setTripSuccessMessage] = useState("");

  const [editTripTitle, setEditTripTitle] = useState("");
  const [editTripDestination, setEditTripDestination] = useState("");
  const [editTripImageUrl, setEditTripImageUrl] = useState("");
  const [editTripStartDate, setEditTripStartDate] = useState("");
  const [editTripEndDate, setEditTripEndDate] = useState("");
  const [editCurrencies, setEditCurrencies] = useState<string[]>([
    "NOK",
    "EUR",
    "USD",
  ]);

  const {
    tripMembers,
    newTravellerName,
    setNewTravellerName,
    travellerFormError,
    setTravellerFormError,
    fetchTripMembers,
    addTraveller,
    deleteTraveller,
  } = useTripMembers(id);

  const [tripFormError, setTripFormError] = useState("");
  const [showTravellersSheet, setShowTravellersSheet] = useState(false);
  const [showTripSetupSheet, setShowTripSetupSheet] = useState(false);
  const [showInviteFriendsSheet, setShowInviteFriendsSheet] = useState(false);
  const [showTripCurrenciesSheet, setShowTripCurrenciesSheet] = useState(false);
  const [hasReviewedCurrencies, setHasReviewedCurrencies] = useState(false);
  const [returnToSetupAfterEdit, setReturnToSetupAfterEdit] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  const {
    trip,
    setTrip,
    isTripLoading,
    setIsTripLoading,
    currentUserId,
    currentUserRole,
    currentUserDisplayName,
    tripInvites,
    tripCollaborators,
    applyTripToState,
    fetchTrip,
    fetchTripInvites,
    fetchTripCollaborators,
    loadCurrentUser,
  } = useTripData(id);

  const {
    bookings,
    fetchBookings,
  } = useTripBookings(id);

  const [activeFilter, setActiveFilter] = useState<BookingFilter>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [bookingSuccessMessage, setBookingSuccessMessage] = useState("");
  const [bookingFormError, setBookingFormError] = useState("");
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState("");

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
  const [showStaysSheet, setShowStaysSheet] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
  });

  const bookingFormRef = useRef<HTMLFormElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  function openConfirm(config: Omit<Extract<ConfirmState, { open: true }>, "open">) {
    setConfirmState({
      open: true,
      ...config,
    });
  }

  function closeConfirm() {
    setConfirmState({ open: false });
  }

  async function inviteTravellerByEmail() {
    const name = inviteName.trim();
    const email = inviteEmail.trim().toLowerCase();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setInviteMessage("You must be signed in to invite someone.");
      return;
    }

    if (user?.email && email === user.email.toLowerCase()) {
      setInviteMessage("You’re already on this trip.");
      setInviteName("");
      setInviteEmail("");
      return;
    }

    if (!name) {
      setInviteMessage("Enter a traveller name.");
      return;
    }

    if (!email) {
      setInviteMessage("Enter an email address.");
      return;
    }

    const { data: inviteCheck, error: inviteCheckError } = await supabase.rpc(
      "can_invite_to_trip",
      {
        target_trip_id: id,
        target_email: email,
      }
    );

    if (inviteCheckError) {
      setInviteMessage(inviteCheckError.message);
      return;
    }

    if (inviteCheck === "already_invited") {
      setInviteMessage("This person already has a pending invitation.");
      return;
    }

    if (
      inviteCheck === "already_joined" ||
      inviteCheck === "already_collaborator"
    ) {
      setInviteMessage("This person is already on this trip.");
      return;
    }

    const { error } = await createTripInvite(
      id,
      name,
      email,
      user.id,
      currentUserDisplayName || user.email || "Someone"
    );

    if (error) {
      setInviteMessage(error.message);
      return;
    }

    const emailResponse = await fetch("/api/send-trip-invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        tripTitle: trip?.title || "a trip",
        inviterName: "Someone",
      }),
    });

    if (!emailResponse.ok) {
      setInviteEmail("");
      setInviteName("");
      setInviteMessage(
        "Invite saved, but the email could not be sent. You may need to tell them manually."
      );

      fetchTripInvites();
      fetchTripCollaborators();
      fetchTripMembers();
      return;
    }

    setInviteEmail("");
    setInviteName("");
    setInviteMessage(
      "Invite sent. They’ll receive an email with instructions."
    );

    fetchTripInvites();
    fetchTripCollaborators();
    fetchTripMembers();
  }

  useEffect(() => {
    async function checkAuthAndLoad() {
      if (!Number.isFinite(id)) {
        setIsTripLoading(false);
        return;
      }
      const user = await loadCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }
      fetchTrip();
      fetchBookings();
      fetchTripMembers();
      fetchTripCollaborators();
      fetchTripInvites();
    }

    checkAuthAndLoad();
  }, [id]);

  useEffect(() => {
    if (searchParams.get("setup") === "1") {
      setShowTripSetupSheet(true);
    }
  }, [searchParams]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowTripForm(false);
        setShowBookingForm(false);
        setShowTravellersSheet(false);
        setShowStaysSheet(false);
        closeConfirm();
      }
    }

    if (
      showTripForm ||
      showBookingForm ||
      showTravellersSheet ||
      showStaysSheet ||
      confirmState.open
    ) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [
    showTripForm,
    showBookingForm,
    showTravellersSheet,
    showStaysSheet,
    confirmState.open,
  ]);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

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

    const { error } = await updateTrip(id, {
      title: editTripTitle.trim(),
      destination: editTripDestination.trim(),
      image_url: editTripImageUrl.trim() || null,
      start_date: editTripStartDate,
      end_date: editTripEndDate,
      currencies: editCurrencies,
    });

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

    if (returnToSetupAfterEdit) {
      setReturnToSetupAfterEdit(false);
      window.setTimeout(() => {
        setShowTripSetupSheet(true);
      }, 250);
    }

    setTimeout(() => {
      setTripSuccessMessage("");
    }, 2000);
  }

  async function handleDeleteTripConfirmed() {
    const { error } = await deleteTrip(id);

    if (error) {
      console.error("Error deleting trip:", error);
      setTripFormError("We couldn’t delete the trip. Please try again.");
      return;
    }

    closeConfirm();
    router.push("/");
  }

  async function handleLeaveTripConfirmed() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id || !user?.email) {
      setTripFormError("We couldn’t identify your account. Please sign in again.");
      return;
    }

    const { error: collaboratorError } = await leaveTripAsCollaborator(
      id,
      user.id
    );

    if (collaboratorError) {
      console.error("Error leaving trip:", collaboratorError);
      setTripFormError(
        "We couldn’t remove you from this trip. Please try again."
      );
      return;
    }

    closeConfirm();
    setShowTripForm(false);
    localStorage.removeItem("cached-trips");
    router.push("/");
  }
  async function handleTransferOwnershipConfirmed(member: TripMember) {
    if (!member.user_id) {
      setTripFormError("This traveller does not have an app account.");
      return;
    }

    const { error } = await transferTripOwnership(
      id,
      member.user_id,
      `Ownership transferred to ${member.name}`
    );

    if (error) {
      console.error("Error transferring ownership:", error);
      setTripFormError(error.message);
      return;
    }

    closeConfirm();
    await fetchTrip();
    await fetchTripMembers();
    await fetchTripCollaborators();
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

  function handleTransferOwnership(member: TripMember) {
    openConfirm({
      title: "Transfer ownership?",
      description: `${member.name} will become the owner of this trip. You will become an editor and keep access.`,
      confirmLabel: "Transfer ownership",
      cancelLabel: "Cancel",
      tone: "danger",
      onConfirm: () => handleTransferOwnershipConfirmed(member),
    });
  }

  function handleLeaveTrip() {
    if (isTripOwner) {
      setTripFormError("Trip owners can’t leave their own trip. Delete the trip instead, or transfer ownership later.");
      return;
    }

    openConfirm({
      title: "Leave this trip?",
      description:
        "You will lose access to this trip. The trip will not be deleted for other travellers.",
      confirmLabel: "Leave trip",
      cancelLabel: "Stay",
      tone: "danger",
      onConfirm: handleLeaveTripConfirmed,
    });
  }

  async function handleDeleteInviteConfirmed(inviteId: number) {
    const { error } = await deleteTripInvite(inviteId);

    if (error) {
      console.error("Error deleting invite:", error);
      setInviteMessage("We couldn’t remove this invite. Please try again.");
      return;
    }

    closeConfirm();
    await fetchTripInvites();
    await fetchTripCollaborators();
    await fetchTripMembers();
  }

  async function handleResendInvite(invite: TripInvite) {
    try {
      const emailResponse = await fetch("/api/send-trip-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: invite.email,
          tripTitle: trip?.title || "a trip",
          inviterName: "Someone",
        }),
      });

      if (!emailResponse.ok) {
        setInviteMessage("Could not resend email. Please try again.");
        return;
      }

      setInviteMessage("Invitation email resent.");
    } catch (err) {
      console.error("Error resending invite:", err);
      setInviteMessage("Something went wrong while resending.");
    }
  }

  function handleDeleteInvite(inviteId: number) {
    openConfirm({
      title: "Remove this invite?",
      description:
        "This will remove this person's access to the trip if they have not joined yet.",
      confirmLabel: "Remove invite",
      cancelLabel: "Keep invite",
      tone: "danger",
      onConfirm: () => handleDeleteInviteConfirmed(inviteId),
    });
  }

  function handleDeleteTraveller(memberId: number) {
    openConfirm({
      title: "Remove this traveller?",
      description:
        "This will remove them from the trip. Shared cost entries connected to them may be affected.",
      confirmLabel: "Remove traveller",
      cancelLabel: "Keep traveller",
      tone: "danger",
      onConfirm: async () => {
        const success = await deleteTraveller(memberId);

        if (success) {
          closeConfirm();
        }
      },
    });
  }

  function handleRemoveCollaborator(member: TripMember) {
    if (!member.user_id) return;

    openConfirm({
      title: "Remove editor access?",
      description:
        "This person will lose access to the trip, but they will remain as a traveller for cost sharing history.",
      confirmLabel: "Remove access",
      cancelLabel: "Keep access",
      tone: "danger",
      onConfirm: async () => {
        const { error } = await removeTripCollaborator(id, member.user_id!);

        if (error) {
          console.error("Error removing collaborator:", error);
          setTripFormError("We couldn’t remove this collaborator. Please try again.");
          return;
        }

        closeConfirm();
        await fetchTripMembers();
        await fetchTripInvites();
        await fetchTripCollaborators();
      },
    });
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

  async function deleteBookingConfirmed(bookingId: number) {
    setBookingFormError("");

    const { error } = await deleteBookingById(bookingId);

    if (error) {
      console.error("Error deleting booking:", error);
      setBookingFormError("We couldn’t delete this booking. Please try again.");
      return;
    }

    if (expandedId === bookingId) {
      setExpandedId(null);
    }

    closeConfirm();
    setDeleteSuccessMessage("Booking deleted successfully.");

    setTimeout(() => {
      setDeleteSuccessMessage("");
    }, 3000);

    await fetchBookings();
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

    if (newEndTime && newEndTime < newStartTime) {
      setBookingFormError(
        newType === "flight"
          ? "Arrival cannot be before departure."
          : "End time cannot be before start time."
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
      const response = await updateBooking(editingBookingId, payload);

      error = response.error;
    } else {
      const response = await createBooking(id, payload);

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

  const isTripOwner = Boolean(
    trip && currentUserId && trip.user_id === currentUserId
  );
  const canManageTrip = isTripOwner || currentUserRole === "editor";
  const canInvitePeople = canManageTrip;
  const canManageTravellers = canManageTrip;
  const canDeleteTrip = isTripOwner;

  const filterOptions: BookingFilter[] = ["all", "flight", "hotel", "plans"];

  const tripNights = useMemo(() => {
    if (!trip?.start_date || !trip?.end_date) return 0;

    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }, [trip]);

  const hotelStays = useMemo(() => {
    return bookings
      .filter((booking) => booking.type === "hotel")
      .map((booking) => {
        const start = booking.start_time ? new Date(booking.start_time) : null;
        const end = booking.end_time ? new Date(booking.end_time) : null;

        let nights = 0;

        if (
          start &&
          end &&
          !Number.isNaN(start.getTime()) &&
          !Number.isNaN(end.getTime())
        ) {
          const diffMs = end.getTime() - start.getTime();
          const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
          nights = diffDays > 0 ? diffDays : 0;
        }

        return {
          id: booking.id,
          hotelName: booking.hotel_name || booking.title || "Hotel stay",
          address: booking.address || "",
          startTime: booking.start_time,
          endTime: booking.end_time || "",
          nights,
        };
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [bookings]);

  const heroStats = useMemo(() => {
    const pendingInviteCount = tripInvites.filter(
      (invite) => invite.status === "pending"
    ).length;

    const visibleTravellerCount =
      tripMembers.length + pendingInviteCount;

    return [
      {
        label: visibleTravellerCount === 1 ? "traveller" : "travellers",
        value: String(visibleTravellerCount),
        onClick: () => setShowTravellersSheet(true),
        ariaLabel: "Show travellers",
      },
      {
        label: bookings.length === 1 ? "booking" : "bookings",
        value: String(bookings.length),
        onClick: () => {
          timelineRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        },
        ariaLabel: "Scroll to bookings",
      },
      {
        label: tripNights === 1 ? "night" : "nights",
        value: String(tripNights),
        onClick: hotelStays.length > 0 ? () => setShowStaysSheet(true) : undefined,
        ariaLabel: hotelStays.length > 0 ? "Show hotel stays" : undefined,
      },
    ];
  }, [tripMembers.length, tripInvites, bookings.length, tripNights, hotelStays.length]);

  if (isTripLoading) {
    return (
      <main className="mx-auto w-full max-w-3xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
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
      <main className="mx-auto w-full max-w-3xl overflow-x-hidden px-4 py-10 sm:px-6">
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
          tripId={trip.id}
          onEdit={() => {
            setShowTripForm(true);
            setShowBookingForm(false);
            setTripFormError("");
            setTravellerFormError("");
          }}
          stats={heroStats}
        />

        {(tripSuccessMessage || bookingSuccessMessage || deleteSuccessMessage) && (
          <div className="fixed inset-1 z-[70] flex items-center justify-center bg-black/10 px-6 pointer-events-none">
            <div className="toast-in pointer-events-auto w-full max-w-sm rounded-[2rem] border border-white/70 bg-white/90 px-6 py-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.20)] backdrop-blur-xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-2xl shadow-sm">
                ✓
              </div>

              <p className="text-lg font-semibold tracking-[-0.02em] text-stone-900">
                {bookingSuccessMessage || tripSuccessMessage || deleteSuccessMessage}
              </p>

              <p className="mt-1 text-sm text-stone-500">
                {deleteSuccessMessage
                  ? "The booking has been removed."
                  : "Your itinerary has been updated."}
              </p>
            </div>
          </div>
        )}

        <section className="mb-2 -mx-2 overflow-x-auto px-4 scrollbar-hide">
          <div className="flex gap-2 pb-1">
            <button
              type="button"
              onClick={openNewBookingForm}
              className="flex min-w-[105px] flex-col items-center justify-center rounded-xl border border-stone-200 bg-white px- py-3 text-center shadow-sm transition active:scale-[0.97]"
            >
              <span className="flex items-center gap">
                <span className="text-[15px] font-semibold text-stone-950">
                  Add booking
                </span>
              </span>
            </button>

            <Link
              href={`/trips/${trip.id}/packing`}
              className="flex min-w-[105px] flex-col items-center justify-center rounded-xl border border-stone-200 bg-white px- py-3 text-center shadow-sm transition active:scale-[0.97]"
            >
              <span className="flex items-center">
                <span className="text-[15px] font-semibold text-stone-950">
                  Pack List
                </span>
              </span>
            </Link>

            <Link
              href={`/trips/${trip.id}/cost-sharing`}
              className="flex min-w-[105px] flex-col items-center justify-center rounded-xl border border-stone-200 bg-white px- py-3 text-center shadow-sm transition active:scale-[0.97]"
            >
              <span className="flex items-center">
                <span className="text-[15px] font-semibold text-stone-950">
                  Expenses
                </span>
              </span>
            </Link>

          </div>
        </section>

        {bookings.length > 0 && (
          <div className="mb-3 w-full min-w-0 overflow-hidden">
            <div className="grid w-full min-w-0 grid-cols-4 gap-2 overflow-hidden rounded-[1rem] border border-stone-200 bg-white/10 p-2 backdrop-blur-sm">
              {filterOptions.map((filter) => {
                const isActive = activeFilter === filter;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    aria-label={getFilterLabel(filter)}
                    className={`flex h-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition-all duration-200 ${isActive
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
          <div ref={timelineRef}>
            <BookingTimeline
              groupedBookings={groupedBookings}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              onEditBooking={startEditingBooking}
              onDeleteBooking={deleteBooking}
            />
          </div>
        )}
      </main>

      {showTripForm && (
        <EditTripModal
          isTripOwner={isTripOwner}
          currentUserId={currentUserId}
          trip={trip}
          canManageTravellers={canManageTravellers}
          canInvitePeople={canInvitePeople}
          tripCollaborators={tripCollaborators}
          editTripTitle={editTripTitle}
          setEditTripTitle={setEditTripTitle}
          editTripDestination={editTripDestination}
          setEditTripDestination={setEditTripDestination}
          editTripImageUrl={editTripImageUrl}
          setEditTripImageUrl={setEditTripImageUrl}
          editTripStartDate={editTripStartDate}
          setEditTripStartDate={setEditTripStartDate}
          editTripEndDate={editTripEndDate}
          setEditTripEndDate={setEditTripEndDate}
          editCurrencies={editCurrencies}
          setEditCurrencies={setEditCurrencies}
          tripFormError={tripFormError}
          travellerFormError={travellerFormError}
          tripMembers={tripMembers}
          newTravellerName={newTravellerName}
          setNewTravellerName={setNewTravellerName}
          inviteName={inviteName}
          setInviteName={setInviteName}
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
          inviteMessage={inviteMessage}
          tripInvites={tripInvites}
          onClose={resetTripFormFromTrip}
          onSaveTrip={handleSaveTrip}
          onAddTraveller={canManageTravellers ? addTraveller : undefined}
          onDeleteTraveller={canManageTravellers ? handleDeleteTraveller : undefined}
          onRemoveCollaborator={canInvitePeople ? handleRemoveCollaborator : undefined}
          onTransferOwnership={isTripOwner ? handleTransferOwnership : undefined}
          onDeleteInvite={canInvitePeople ? handleDeleteInvite : undefined}
          onResendInvite={canInvitePeople ? handleResendInvite : undefined}
          onInviteTraveller={canInvitePeople ? inviteTravellerByEmail : undefined}
          onDeleteTrip={canDeleteTrip ? handleDeleteTrip : undefined}
          onLeaveTrip={handleLeaveTrip}
        />
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

              <BookingForm
                bookingFormRef={bookingFormRef}
                editingBookingId={editingBookingId}
                bookingFormError={bookingFormError}
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
      {showTravellersSheet && (
        <div
          className="fixed inset-0 z-50 flex min-h-[100dvh] items-end justify-center bg-black/45 px-3 pt-12 pb-6 backdrop-blur-[2px] sm:items-center sm:p-6"
          onClick={() => setShowTravellersSheet(false)}
        >
          <div
            className="sheet-up flex max-h-[calc(100dvh-3rem)] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-stone-900">
                  Travellers
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Everyone joining this trip.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowTravellersSheet(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
                aria-label="Close travellers"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto space-y-4 px-5 py-5">
              <TripPeopleList
                trip={trip}
                tripMembers={tripMembers}
                tripInvites={tripInvites}
                canManageTravellers={canManageTravellers}
                tripCollaborators={tripCollaborators}
                currentUserId={currentUserId}
                canInvitePeople={canInvitePeople}
                canTransferOwnership={isTripOwner}
                newTravellerName={newTravellerName}
                setNewTravellerName={setNewTravellerName}
                travellerFormError={travellerFormError}
                inviteName={inviteName}
                setInviteName={setInviteName}
                inviteEmail={inviteEmail}
                setInviteEmail={setInviteEmail}
                inviteMessage={inviteMessage}
                onAddTraveller={addTraveller}
                onInviteTraveller={inviteTravellerByEmail}
                onDeleteTraveller={handleDeleteTraveller}
                onRemoveCollaborator={handleRemoveCollaborator}
                onLeaveTrip={handleLeaveTrip}
                onTransferOwnership={handleTransferOwnership}
                onDeleteInvite={handleDeleteInvite}
                onResendInvite={handleResendInvite}
              />
            </div>
          </div>
        </div>
      )}

      {showTripCurrenciesSheet && (
        <TripCurrenciesSheet
          editCurrencies={editCurrencies}
          setEditCurrencies={setEditCurrencies}
          onClose={() => {
            resetTripFormFromTrip();
            setShowTripCurrenciesSheet(false);
            setHasReviewedCurrencies(true);
            setShowTripSetupSheet(true);
          }}
          onSave={async () => {
            const { error } = await updateTrip(id, {
              title: editTripTitle.trim(),
              destination: editTripDestination.trim(),
              image_url: editTripImageUrl.trim() || null,
              start_date: editTripStartDate,
              end_date: editTripEndDate,
              currencies: editCurrencies,
            });

            if (error) {
              console.error("Error updating currencies:", error);
              return;
            }

            await fetchTrip();
            setHasReviewedCurrencies(true);
            setShowTripCurrenciesSheet(false);
            setShowTripSetupSheet(true);
          }}
        />
      )}

      {showInviteFriendsSheet && canInvitePeople && (
        <InviteFriendsSheet
          inviteName={inviteName}
          setInviteName={setInviteName}
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
          inviteMessage={inviteMessage}
          tripInvites={tripInvites}
          onClose={() => {
            setShowInviteFriendsSheet(false);
            setShowTripSetupSheet(true);
          }}
          onSendInvite={inviteTravellerByEmail}
          onDeleteInvite={handleDeleteInvite}
          onResendInvite={handleResendInvite}
        />
      )}

      {showStaysSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pt-12 pb-6 backdrop-blur-[2px] sm:items-center sm:p-6"
          onClick={() => setShowStaysSheet(false)}
        >
          <div
            className="sheet-up flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-stone-900">
                  Stays
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Your hotel stays and nights.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowStaysSheet(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
                aria-label="Close stays"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto space-y-3 px-5 py-5">
              {hotelStays.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center">
                  <p className="text-sm text-stone-500">No hotels booked yet.</p>
                </div>
              ) : (
                hotelStays.map((stay) => (
                  <div
                    key={stay.id}
                    className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-stone-900">
                          {stay.hotelName}
                        </p>

                        <p className="mt-1 text-sm text-stone-500">
                          {formatTripDateRange(stay.startTime, stay.endTime)}
                        </p>

                        {stay.address && (
                          <p className="mt-2 text-sm text-stone-600">
                            {stay.address}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm">
                        {stay.nights} {stay.nights === 1 ? "night" : "nights"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {showTripSetupSheet && (
        <TripSetupSheet
          inviteComplete={tripInvites.length > 0}
          currenciesComplete={hasReviewedCurrencies}
          onClose={() => {
            setShowTripSetupSheet(false);
            router.replace(`/trips/${id}`);
          }}
          onInviteTravellers={() => {
            if (!canInvitePeople) {
              setShowTripSetupSheet(false);
              router.replace(`/trips/${id}`);
              return;
            }

            setShowTripSetupSheet(false);
            setInviteName("");
            setInviteEmail("");
            setInviteMessage("");
            setShowInviteFriendsSheet(true);
            router.replace(`/trips/${id}`);
          }}
          onChooseCurrencies={() => {
            setShowTripSetupSheet(false);
            setShowTripCurrenciesSheet(true);
            router.replace(`/trips/${id}`);
          }}
        />
      )}
      <ScrollToTopButton />
    </>
  );
}