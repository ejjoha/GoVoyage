import type { PackingListItem } from "../types/packing.types";

type SuggestedItem = Pick<
    PackingListItem,
    "name" | "category" | "quantity" | "source" | "packed" | "hidden" | "protected"
>;

const activityItems: Record<string, SuggestedItem[]> = {
    Beach: [
        { name: "Swimsuit", category: "Beach & Swim", quantity: 2, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Beach towel", category: "Beach & Swim", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Flip-flops", category: "Footwear", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Waterproof phone pouch", category: "Beach & Swim", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Beach bag", category: "Beach & Swim", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    Nightlife: [
        { name: "Nice outfit", category: "Nightlife", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Dress shoes or nice shoes", category: "Footwear", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    "Business meetings": [
        { name: "Business outfit", category: "City & Business", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Laptop", category: "Tech", quantity: 1, source: "suggested", packed: false, hidden: false, protected: true },
        { name: "Laptop charger", category: "Tech", quantity: 1, source: "suggested", packed: false, hidden: false, protected: true },
        { name: "Notebook and pen", category: "City & Business", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    Hiking: [
        { name: "Hiking boots", category: "Outdoor & Hiking", quantity: 1, source: "suggested", packed: false, hidden: false, protected: true },
        { name: "Daypack", category: "Outdoor & Hiking", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Hiking socks", category: "Outdoor & Hiking", quantity: 2, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Reusable water bottle", category: "Comfort & Travel", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    Swimming: [
        { name: "Swimsuit", category: "Beach & Swim", quantity: 2, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Goggles", category: "Beach & Swim", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    "Fine dining": [
        { name: "Dressy outfit", category: "Dining & Events", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Dress shoes or nice shoes", category: "Footwear", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    Museums: [
        { name: "Comfortable walking shoes", category: "Footwear", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    Shopping: [
        { name: "Foldable tote bag", category: "Comfort & Travel", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    "City walks": [
        { name: "Comfortable walking shoes", category: "Footwear", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Day bag", category: "Comfort & Travel", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
};

function normalizeName(name: string) {
    return name.trim().toLowerCase();
}

export function getActivityPackingItems({
    activities,
    existingItems,
}: {
    activities: string[];
    existingItems: PackingListItem[];
}) {
    const existingNames = new Set(
        existingItems.map((item) => normalizeName(item.name))
    );

    return activities
        .flatMap((activity) => activityItems[activity] ?? [])
        .filter((item) => !existingNames.has(normalizeName(item.name)));
}