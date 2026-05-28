export type PackingListType =
    | "personal"
    | "shared"
    | "luggage"
    | "activity";

export type PackingItemSource =
    | "suggested"
    | "custom"
    | "template";

export type PackingList = {
    id: string;
    trip_id: number;
    member_id: number | null;
    title: string;
    type: PackingListType;
    emoji: string | null;
    color: string | null;
    created_by: string | null;
    archived: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
};

export type PackingListItem = {
    id: string;
    packing_list_id: string;
    name: string;
    category: string;
    quantity: number;
    packed: boolean;
    packed_at: string | null;
    packed_by: string | null;
    responsible_member_id: number | null;
    source: PackingItemSource;
    notes: string | null;
    protected: boolean;
    hidden: boolean;
    sort_order: number;
    added_by: string | null;
    created_at: string;
    updated_at: string;
};