import { supabase } from "@/lib/supabase";
import type { PackingListItem } from "../types/packing.types";

export async function createPackingList({
    tripId,
    memberId,
    title,
    type,
    emoji,
}: {
    tripId: number;
    memberId?: number | null;
    title: string;
    type: "personal" | "shared" | "luggage" | "activity";
    emoji?: string | null;
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
            emoji: emoji ?? null,
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
    category = "General",
}: {
    packingListId: string;
    name: string;
    category?: string;
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

export async function archivePackingList(listId: string) {
    const { error } = await supabase
        .from("packing_lists")
        .update({
            archived: true,
            updated_at: new Date().toISOString(),
        })
        .eq("id", listId);

    if (error) {
        console.error(error);
        throw error;
    }
}

export async function createSuggestedPackingItems({
    packingListId,
    items,
}: {
    packingListId: string;
    items: Array<
        Pick<
            PackingListItem,
            "name" | "category" | "quantity" | "source" | "packed" | "hidden" | "protected"
        >
    >;
}) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from("packing_list_items")
        .insert(
            items.map((item) => ({
                packing_list_id: packingListId,
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                source: item.source,
                packed: item.packed,
                hidden: item.hidden,
                protected: item.protected,
                added_by: user?.id ?? null,
            }))
        )
        .select();

    if (error) {
        console.error(error);
        throw error;
    }

    return data;
}