import { supabase } from "@/lib/supabase";

export async function getTrips() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: true });

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

    const { data, error } = await supabase
        .from("trips")
        .insert({
            title,
            destination,
            start_date,
            end_date,
            image_url: image_url || null,
            currencies: currencies || ["NOK", "EUR", "USD"],
            user_id: user.id,
        })
        .select()
        .single();

    if (error || !data) {
        throw new Error(error?.message || "Failed to create trip");
    }

    return data;
}

export async function addTripMembers(tripId: number, travellers: { name: string }[]) {
    if (travellers.length === 0) return;

    const rows = travellers.map((traveller) => ({
        trip_id: tripId,
        name: traveller.name,
    }));

    const { error } = await supabase
        .from("trip_members")
        .insert(rows);

    if (error) {
        throw new Error(error.message);
    }
}