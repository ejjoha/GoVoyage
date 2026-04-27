import { supabase } from "@/lib/supabase";

export async function getTrips() {
    const { data, error } = await supabase
        .from("trips")
        .select("*")
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
}: {
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    image_url?: string;
}) {
    const { data, error } = await supabase
        .from("trips")
        .insert({
            title,
            destination,
            start_date,
            end_date,
            image_url: image_url || null,
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