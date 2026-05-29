import { supabase } from "@/lib/supabase";

export async function getPackingLists(tripId: number) {
    const { data, error } = await supabase
        .from("packing_lists")
        .select("*")
        .eq("trip_id", tripId)
        .eq("archived", false)
        .order("sort_order", { ascending: true });

    if (error) {
        console.error(error);
        throw error;
    }

    return data;
}

export async function getPackingItems(packingListId: string) {
    const { data, error } = await supabase
        .from("packing_list_items")
        .select("*")
        .eq("packing_list_id", packingListId)
        .eq("hidden", false)
        .order("sort_order", { ascending: true });

    if (error) {
        console.error(error);
        throw error;
    }

    return data;
}

export async function getTripMembers(tripId: number) {
    const { data, error } = await supabase
        .from("trip_members")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error(error);
        throw error;
    }

    return data;
}

export async function getTripForPacking(tripId: number) {
    const { data, error } = await supabase
        .from("trips")
        .select("id, title, destination, image_url, start_date, end_date")
        .eq("id", tripId)
        .single();

    if (error) {
        console.error(error);
        throw error;
    }

    return data;
}