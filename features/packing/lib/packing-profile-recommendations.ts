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
        { name: "Dining outfit", category: "Dining & Events", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
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
const climateItems: Record<string, SuggestedItem[]> = {
    "Hot weather": [
        { name: "High SPF sunscreen", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Sun hat", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Breathable shirts", category: "Clothing", quantity: 3, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "After-sun lotion", category: "Toiletries", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Electrolyte tablets", category: "Health & Safety", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    Warm: [
        { name: "Light shirts", category: "Clothing", quantity: 3, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Shorts", category: "Clothing", quantity: 2, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Light sweater", category: "Clothing", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Sunglasses", category: "Comfort & Travel", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    "Cool weather": [
        { name: "Long-sleeve shirt", category: "Clothing", quantity: 2, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Light sweater", category: "Clothing", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Light jacket", category: "Clothing", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Long pants", category: "Clothing", quantity: 2, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    "Cold weather": [
        { name: "Warm coat", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: true },
        { name: "Thermal base layers", category: "Weather", quantity: 2, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Beanie", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Gloves", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Scarf or neck warmer", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Warm socks", category: "Footwear", quantity: 2, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    Freezing: [
        { name: "Heavy winter coat", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: true },
        { name: "Thermal underwear", category: "Weather", quantity: 2, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Wool socks", category: "Footwear", quantity: 3, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Winter boots", category: "Footwear", quantity: 1, source: "suggested", packed: false, hidden: false, protected: true },
        { name: "Thermal gloves", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Hand warmers", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    Rainy: [
        { name: "Umbrella", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Waterproof jacket", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Waterproof shoes", category: "Footwear", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Dry bag", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Extra socks", category: "Clothing", quantity: 2, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    Snowy: [
        { name: "Snow boots", category: "Footwear", quantity: 1, source: "suggested", packed: false, hidden: false, protected: true },
        { name: "Snow pants", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Ski gloves", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Neck warmer", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    Windy: [
        { name: "Windproof shell", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Neck warmer", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Lip balm", category: "Toiletries", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    Humid: [
        { name: "Quick-dry clothing", category: "Clothing", quantity: 2, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Extra tops", category: "Clothing", quantity: 2, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Travel powder", category: "Toiletries", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    Dry: [
        { name: "Lip balm", category: "Toiletries", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Moisturizer", category: "Toiletries", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Eye drops", category: "Health & Safety", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Hydration tablets", category: "Health & Safety", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
    ],
    Mountains: [
        { name: "Daypack", category: "Outdoor & Hiking", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Hiking socks", category: "Outdoor & Hiking", quantity: 2, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Insulating layer", category: "Outdoor & Hiking", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Windproof shell", category: "Weather", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
        { name: "Offline maps", category: "Outdoor & Hiking", quantity: 1, source: "suggested", packed: false, hidden: false, protected: true },
        { name: "Trail snacks", category: "Outdoor & Hiking", quantity: 1, source: "suggested", packed: false, hidden: false, protected: false },
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

    const generatedNames = new Set<string>();

    return activities
        .flatMap((activity) => activityItems[activity] ?? [])
        .filter((item) => {
            const normalized = normalizeName(item.name);

            if (existingNames.has(normalized)) return false;
            if (generatedNames.has(normalized)) return false;

            generatedNames.add(normalized);
            return true;
        });
}
export function getClimatePackingItems({
    climate,
    existingItems,
}: {
    climate: string[];
    existingItems: PackingListItem[];
}) {
    const existingNames = new Set(
        existingItems.map((item) => normalizeName(item.name))
    );

    const generatedNames = new Set<string>();

    return climate
        .flatMap((condition) => climateItems[condition] ?? [])
        .filter((item) => {
            const normalized = normalizeName(item.name);

            if (existingNames.has(normalized)) return false;
            if (generatedNames.has(normalized)) return false;

            generatedNames.add(normalized);
            return true;
        });
}