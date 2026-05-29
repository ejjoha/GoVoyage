import type {
    PackingList,
    PackingListItem,
} from "../types/packing.types";

type SuggestedPackingItem = {
    name: string;
    category: string;
    quantity?: number;
};

const personalEssentials: SuggestedPackingItem[] = [
    { name: "Passport or ID", category: "Essentials" },
    { name: "Wallet", category: "Essentials" },
    { name: "Phone", category: "Tech" },
    { name: "Phone charger", category: "Tech" },
    { name: "Underwear", category: "Clothing" },
    { name: "Socks", category: "Clothing" },
    { name: "Sleepwear", category: "Clothing" },
    { name: "Toothbrush", category: "Toiletries" },
    { name: "Medication", category: "Health & Safety" },
];

const carryOnEssentials: SuggestedPackingItem[] = [
    { name: "Passport or ID", category: "Essentials" },
    { name: "Wallet", category: "Essentials" },
    { name: "Phone", category: "Tech" },
    { name: "Phone charger", category: "Tech" },
    { name: "Power bank", category: "Tech" },
    { name: "Headphones", category: "Comfort & Travel" },
    { name: "Travel snacks", category: "Comfort & Travel" },
    { name: "Medication", category: "Health & Safety" },
];

const sharedBagEssentials: SuggestedPackingItem[] = [
    { name: "Travel adapter", category: "Tech" },
    { name: "First aid kit", category: "Health & Safety" },
    { name: "Sunscreen", category: "Weather" },
    { name: "Laundry bag", category: "Laundry" },
    { name: "Travel snacks", category: "Comfort & Travel" },
];

const kidsEssentials: SuggestedPackingItem[] = [
    { name: "Kids’ documents", category: "Kids & Family" },
    { name: "Snacks", category: "Kids & Family" },
    { name: "Water bottle", category: "Kids & Family" },
    { name: "Wipes", category: "Kids & Family" },
    { name: "Favorite toy", category: "Kids & Family" },
    { name: "Spare clothes", category: "Kids & Family" },
    { name: "Pajamas", category: "Kids & Family" },
    { name: "Medication", category: "Kids & Family" },
];

function calculateSmartQuantity(item: SuggestedPackingItem, tripDays: number) {
    const days = Math.max(1, tripDays);

    if (item.name === "Underwear") return Math.min(days, 14);
    if (item.name === "Socks") return Math.min(days, 14);
    if (item.name === "Spare clothes") return Math.min(days, 7);
    if (item.name === "Pajamas") return Math.max(1, Math.ceil(days / 4));

    return item.quantity ?? 1;
}

export function getSuggestedItemsForList({
    list,
    tripDays,
}: {
    list: PackingList;
    tripDays: number;
}): Array<
    Pick<
        PackingListItem,
        "name" | "category" | "quantity" | "source" | "packed" | "hidden" | "protected"
    >
> {
    let suggestions: SuggestedPackingItem[] = [];

    const normalizedTitle = list.title.toLowerCase();

    if (normalizedTitle.includes("kid")) {
        suggestions = kidsEssentials;
    } else if (list.type === "luggage" || normalizedTitle.includes("carry")) {
        suggestions = carryOnEssentials;
    } else if (list.type === "shared") {
        suggestions = sharedBagEssentials;
    } else {
        suggestions = personalEssentials;
    }

    return suggestions.map((item) => ({
        name: item.name,
        category: item.category,
        quantity: calculateSmartQuantity(item, tripDays),
        source: "suggested",
        packed: false,
        hidden: false,
        protected: false,
    }));
}