export type PackingItem = {
    key: string;
    name: string;
    category: string;
    packed: boolean;
    quantity: number;
    protected?: boolean;
    source: "suggested" | "custom";
};

export const baseItems: PackingItem[] = [
    {
        key: "passport",
        name: "Passport",
        category: "Essentials",
        packed: false,
        quantity: 1,
        source: "suggested",
    },
    {
        key: "wallet",
        name: "Wallet",
        category: "Essentials",
        packed: false,
        quantity: 1,
        source: "suggested",
    },
    {
        key: "charger",
        name: "Phone charger",
        category: "Essentials",
        packed: false,
        quantity: 1,
        source: "suggested",
    },
];

export const climateSuggestions: Record<string, PackingItem[]> = {
    Tropical: [
        {
            key: "sunscreen",
            name: "Sunscreen",
            category: "Tropical",
            packed: false,
            quantity: 1,
            source: "suggested",
        },
        {
            key: "swimwear",
            name: "Swimwear",
            category: "Tropical",
            packed: false,
            quantity: 2,
            source: "suggested",
        },
        {
            key: "mosquito-spray",
            name: "Mosquito spray",
            category: "Tropical",
            packed: false,
            quantity: 1,
            source: "suggested",
        },
    ],
    Cold: [
        {
            key: "winter-jacket",
            name: "Winter jacket",
            category: "Cold",
            packed: false,
            quantity: 1,
            source: "suggested",
        },
        {
            key: "gloves",
            name: "Gloves",
            category: "Cold",
            packed: false,
            quantity: 1,
            source: "suggested",
        },
        {
            key: "thermal-layer",
            name: "Thermal layer",
            category: "Cold",
            packed: false,
            quantity: 2,
            source: "suggested",
        },
    ],
    Mountain: [
        {
            key: "hiking-boots",
            name: "Hiking boots",
            category: "Mountain",
            packed: false,
            quantity: 1,
            source: "suggested",
        },
        {
            key: "headlamp",
            name: "Headlamp",
            category: "Mountain",
            packed: false,
            quantity: 1,
            source: "suggested",
        },
    ],
};

export const tripTypeSuggestions: Record<string, PackingItem[]> = {
    Beach: [
        {
            key: "beach-towel",
            name: "Beach towel",
            category: "Beach",
            packed: false,
            quantity: 1,
            source: "suggested",
        },
        {
            key: "sandals",
            name: "Sandals",
            category: "Beach",
            packed: false,
            quantity: 1,
            source: "suggested",
        },
    ],
    Hiking: [
        {
            key: "rain-jacket",
            name: "Rain jacket",
            category: "Hiking",
            packed: false,
            quantity: 1,
            source: "suggested",
        },
        {
            key: "water-bottle",
            name: "Water bottle",
            category: "Hiking",
            packed: false,
            quantity: 1,
            source: "suggested",
        },
    ],
    City: [
        {
            key: "day-bag",
            name: "Day bag",
            category: "City",
            packed: false,
            quantity: 1,
            source: "suggested",
        },
    ],
};

export function createKey(category: string, name: string) {
    return `${category}-${name}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
}

export function getSmartQuantity(item: PackingItem, tripDays: number) {
    const name = item.name.toLowerCase();

    if (name.includes("swimwear")) {
        return tripDays >= 7 ? 2 : 1;
    }

    if (name.includes("thermal layer")) {
        return tripDays >= 7 ? 2 : 1;
    }

    if (name.includes("charger")) {
        return 1;
    }

    if (name.includes("passport")) {
        return 1;
    }

    if (name.includes("wallet")) {
        return 1;
    }

    return item.quantity;
}