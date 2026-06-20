import { supabase } from "@/lib/supabase";

export async function getTrips() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data: collaboratorRows, error: collaboratorError } = await supabase
        .from("trip_collaborators")
        .select("trip_id")
        .eq("user_id", user.id)
        .eq("active", true);

    if (collaboratorError) {
        throw new Error(collaboratorError.message);
    }

    const collaboratorTripIds =
        collaboratorRows?.map((row) => row.trip_id) || [];

    const ownedFilter = `user_id.eq.${user.id}`;
    const collaboratorFilter =
        collaboratorTripIds.length > 0
            ? `id.in.(${collaboratorTripIds.join(",")})`
            : "";

    const filter = collaboratorFilter
        ? `${ownedFilter},${collaboratorFilter}`
        : ownedFilter;

    const { data, error } = await supabase
        .from("trips")
        .select("*")
        .or(filter)
        .order("start_date", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data || [];
}

export type PendingTripInvite = {
    id: number;
    trip_id: number;
    name: string | null;
    email: string;
    role: string;
    accepted_at: string | null;
    status: string;
    inviter_name: string | null;
    trips:
    | {
        id: number;
        title: string;
        destination: string;
        start_date: string;
        end_date: string;
        image_url: string | null;
    }
    | {
        id: number;
        title: string;
        destination: string;
        start_date: string;
        end_date: string;
        image_url: string | null;
    }[]
    | null;
};

export async function getPendingTripInvites() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
        return [];
    }

    const { data, error } = await supabase
        .from("trip_invites")
        .select(`
            id,
            trip_id,
            name,
            email,
            role,
            accepted_at,
            status,
            inviter_name,
            trips (
                id,
                title,
                destination,
                start_date,
                end_date,
                image_url
            )
        `)
        .eq("email", user.email.toLowerCase())
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data || [];
}

export async function createTrip({
    title,
    destination,
    start_date,
    end_date,
    image_url,
    currencies,
}: {
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    image_url?: string;
    currencies?: string[];
}) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("You must be signed in to create a trip.");
    }

    const { data, error } = await supabase.rpc("create_trip_with_owner", {
        p_title: title,
        p_destination: destination,
        p_start_date: start_date,
        p_end_date: end_date,
        p_image_url: image_url || null,
        p_currencies: currencies || ["NOK", "SEK", "EUR"],
    });

    if (error || !data) {
        throw new Error(error?.message || "Failed to create trip");
    }

    return data;
}

export async function addTripMembers(
    tripId: number,
    travellers: { name: string; user_id?: string | null }[]
) {
    if (travellers.length === 0) return;

    const rows = travellers.map((traveller) => ({
        trip_id: tripId,
        name: traveller.name,
        user_id: traveller.user_id || null,
    }));

    const { error } = await supabase
        .from("trip_members")
        .insert(rows);

    if (error) {
        throw new Error(error.message);
    }
}