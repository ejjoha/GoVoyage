import { supabase } from "@/lib/supabase";

export async function createPackingList({
    tripId,
    memberId,
    title,
    type,
}: {
    tripId: number;
    memberId?: number | null;
    title: string;
    type: "personal" | "shared" | "luggage" | "activity";
}) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Not authenticated");
    }

    const { data, error } = await supabase
        .from("packing_lists")
        .insert({
            trip_id: tripId,
            member_id: memberId ?? null,
            title,
            type,
            created_by: user.id,
        })
        .select()
        .single();

    if (error) {
        console.error(error);
        throw error;
    }

    return data;
}

export async function createPackingItem({
    packingListId,
    name,
    category,
}: {
    packingListId: string;
    name: string;
    category: string;
}) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from("packing_list_items")
        .insert({
            packing_list_id: packingListId,
            name,
            category,
            added_by: user?.id ?? null,
        })
        .select()
        .single();

    if (error) {
        console.error(error);
        throw error;
    }

    return data;
}

export async function togglePackedItem({
    itemId,
    packed,
}: {
    itemId: string;
    packed: boolean;
}) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
        .from("packing_list_items")
        .update({
            packed,
            packed_at: packed ? new Date().toISOString() : null,
            packed_by: packed ? user?.id ?? null : null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", itemId);

    if (error) {
        console.error(error);
        throw error;
    }
}