import { supabase } from "@/lib/supabase";
import type { Booking, Trip, TripMember, TripCollaborator } from "./types";

export type TripInvite = {
    id: number;
    name: string | null;
    email: string;
    role: string;
    accepted_at: string | null;
    status: string;
};

export async function getTrip(tripId: number) {
    const response = await supabase
        .from("trips")
        .select("*")
        .eq("id", tripId)
        .single();

    return response as {
        data: Trip | null;
        error: unknown;
    };
}

export async function getTripMembers(tripId: number) {
    const response = await supabase
        .from("trip_members")
        .select("*")
        .eq("trip_id", tripId)
        .eq("active", true)
        .order("created_at", { ascending: true });

    return response as {
        data: TripMember[] | null;
        error: unknown;
    };
}

export async function getTripCollaborators(tripId: number) {
    const response = await supabase
        .from("trip_collaborators")
        .select("*")
        .eq("trip_id", tripId)
        .eq("active", true);

    return response as {
        data: TripCollaborator[] | null;
        error: unknown;
    };
}

export async function removeTripCollaborator(
    tripId: number,
    userId: string
) {
    return supabase.rpc("remove_trip_collaborator", {
        target_trip_id: tripId,
        target_user_id: userId,
    });
}

export async function getBookings(tripId: number) {
    const response = await supabase
        .from("bookings")
        .select("*")
        .eq("trip_id", tripId)
        .order("start_time", { ascending: true });

    return response as {
        data: Booking[] | null;
        error: unknown;
    };
}

export async function getTripInvites(tripId: number) {
    const response = await supabase
        .from("trip_invites")
        .select("id, name, email, role, accepted_at, status")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true });

    return response as {
        data: TripInvite[] | null;
        error: unknown;
    };
}
export async function createTripInvite(
    tripId: number,
    name: string,
    email: string,
    inviterUserId: string,
    inviterName: string
) {
    return supabase.from("trip_invites").insert({
        trip_id: tripId,
        name,
        email,
        role: "editor",
        inviter_user_id: inviterUserId,
        inviter_name: inviterName,
    });
}

export async function createTripMember(
    tripId: number,
    name: string
) {
    return supabase.from("trip_members").insert({
        trip_id: tripId,
        name,
    });
}

export async function deleteTripMember(memberId: number) {
    return supabase.rpc("archive_trip_member", {
        member_id: memberId,
    });
}

export async function leaveTripByEmail(
    tripId: number,
    email: string
) {
    return supabase
        .from("trip_invites")
        .delete()
        .eq("trip_id", tripId)
        .eq("email", email);
}

export async function leaveTripAsCollaborator(
    tripId: number,
    userId: string
) {
    return supabase.rpc("leave_trip", {
        target_trip_id: tripId,
    });
}

export async function leaveTripAsMember(
    tripId: number,
    userId: string
) {
    return supabase
        .from("trip_members")
        .delete()
        .eq("trip_id", tripId)
        .eq("user_id", userId);
}

export type UpdateTripPayload = {
    title: string;
    destination: string;
    image_url: string | null;
    start_date: string;
    end_date: string;
    currencies: string[];
};

export async function updateTrip(
    tripId: number,
    payload: UpdateTripPayload
) {
    return supabase
        .from("trips")
        .update(payload)
        .eq("id", tripId);
}

export async function deleteTrip(tripId: number) {
    return supabase
        .from("trips")
        .delete()
        .eq("id", tripId);
}

export type SaveBookingPayload = {
    type: string;
    title: string;
    start_time: string;
    end_time: string | null;
    location: string | null;
    confirmation_code: string | null;
    notes: string | null;
    airline: string | null;
    flight_number: string | null;
    departure_airport: string | null;
    arrival_airport: string | null;
    hotel_name: string | null;
    address: string | null;
    origin: string | null;
    destination: string | null;
};

export async function createBooking(
    tripId: number,
    payload: SaveBookingPayload
) {
    return supabase.from("bookings").insert({
        trip_id: tripId,
        ...payload,
    });
}

export async function updateBooking(
    bookingId: number,
    payload: SaveBookingPayload
) {
    return supabase
        .from("bookings")
        .update(payload)
        .eq("id", bookingId);
}

export async function deleteBookingById(bookingId: number) {
    return supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);
}

export async function deleteTripInvite(inviteId: number) {
    return supabase.rpc("revoke_trip_invite", {
        invite_id: inviteId,
    });
}

export async function transferTripOwnership(
    tripId: number,
    newOwnerUserId: string,
    reason?: string
) {
    return supabase.rpc("transfer_trip_ownership", {
        p_trip_id: tripId,
        p_new_owner_user_id: newOwnerUserId,
        p_transfer_reason: reason ?? null,
    });
}
