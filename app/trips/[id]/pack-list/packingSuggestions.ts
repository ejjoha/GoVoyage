export type PackingItem = {
    key: string;
    name: string;
    category: string;
    packed: boolean;
    quantity: number;
    protected?: boolean;
    source: "suggested" | "custom";
};

export const packingCategories = [
    "Essentials",
    "Documents & Money",
    "Clothing",
    "Footwear",
    "Toiletries",
    "Health & Safety",
    "Tech",
    "Comfort & Travel",
    "Laundry",
    "Weather",
    "Beach & Swim",
    "Outdoor & Hiking",
    "City & Business",
] as const;

type PackingCategory = (typeof packingCategories)[number];

type PackingTemplateItem = PackingItem & {
    quantityRule?: "fixed" | "perDay" | "perNight" | "everyTwoDays" | "weekly" | "tripDaysMinusOne" | "onePerOutfitDay";
    maxQuantity?: number;
    minQuantity?: number;
};

const item = (
    key: string,
    name: string,
    category: PackingCategory,
    quantity = 1,
    options: Partial<Omit<PackingTemplateItem, "key" | "name" | "category" | "packed" | "quantity" | "source">> = {}
): PackingTemplateItem => ({
    key,
    name,
    category,
    packed: false,
    quantity,
    source: "suggested",
    ...options,
});

export const baseItems: PackingTemplateItem[] = [
    item("passport-or-id", "Passport or ID", "Documents & Money", 1, { protected: true }),
    item("wallet", "Wallet", "Documents & Money", 1, { protected: true }),
    item("payment-card", "Payment card", "Documents & Money", 1, { protected: true }),
    item("travel-insurance-info", "Travel insurance info", "Documents & Money", 1, { protected: true }),
    item("booking-confirmations", "Booking confirmations", "Documents & Money", 1, { protected: true }),
    item("house-keys", "House keys", "Essentials", 1, { protected: true }),

    item("phone", "Phone", "Tech", 1, { protected: true }),
    item("phone-charger", "Phone charger", "Tech", 1, { protected: true }),
    item("power-bank", "Power bank", "Tech", 1),
    item("travel-adapter", "Travel adapter", "Tech", 1),

    item("underwear", "Underwear", "Clothing", 3, {
        quantityRule: "perDay",
        minQuantity: 2,
        maxQuantity: 14,
    }),
    item("socks", "Socks", "Clothing", 3, {
        quantityRule: "perDay",
        minQuantity: 2,
        maxQuantity: 14,
    }),
    item("t-shirts-or-tops", "T-shirts or tops", "Clothing", 3, {
        quantityRule: "everyTwoDays",
        minQuantity: 2,
        maxQuantity: 8,
    }),
    item("pants-or-skirts", "Pants or skirts", "Clothing", 2, {
        quantityRule: "weekly",
        minQuantity: 1,
        maxQuantity: 4,
    }),
    item("sleepwear", "Sleepwear", "Clothing", 1),
    item("comfortable-shoes", "Comfortable shoes", "Footwear", 1),
    item("light-jacket-or-layer", "Light jacket or layer", "Clothing", 1),

    item("toothbrush", "Toothbrush", "Toiletries", 1, { protected: true }),
    item("toothpaste", "Toothpaste", "Toiletries", 1),
    item("deodorant", "Deodorant", "Toiletries", 1),
    item("shampoo-or-hair-care", "Shampoo or hair care", "Toiletries", 1),
    item("skin-care", "Skin care", "Toiletries", 1),
    item("razor-or-grooming-kit", "Razor or grooming kit", "Toiletries", 1),

    item("prescription-medicine", "Prescription medicine", "Health & Safety", 1, { protected: true }),
    item("pain-reliever", "Pain reliever", "Health & Safety", 1),
    item("basic-first-aid", "Basic first aid", "Health & Safety", 1),

    item("reusable-water-bottle", "Reusable water bottle", "Comfort & Travel", 1),
    item("sunglasses", "Sunglasses", "Comfort & Travel", 1),
    item("snacks", "Travel snacks", "Comfort & Travel", 1),
    item("laundry-bag", "Laundry bag", "Laundry", 1),
];

export const climateSuggestions: Record<string, PackingTemplateItem[]> = {
    tropical: [
        item("reef-safe-sunscreen", "Reef-safe sunscreen", "Weather", 1),
        item("insect-repellent", "Insect repellent", "Health & Safety", 1),
        item("lightweight-rain-jacket", "Lightweight rain jacket", "Weather", 1),
        item("breathable-shirts", "Breathable shirts", "Clothing", 3, {
            quantityRule: "everyTwoDays",
            minQuantity: 2,
            maxQuantity: 7,
        }),
        item("sun-hat", "Sun hat", "Weather", 1),
    ],

    cold: [
        item("warm-coat", "Warm coat", "Weather", 1, { protected: true }),
        item("thermal-base-layers", "Thermal base layers", "Weather", 2, {
            quantityRule: "everyTwoDays",
            minQuantity: 1,
            maxQuantity: 5,
        }),
        item("gloves", "Gloves", "Weather", 1),
        item("beanie", "Beanie", "Weather", 1),
        item("scarf-or-neck-warmer", "Scarf or neck warmer", "Weather", 1),
        item("warm-socks", "Warm socks", "Footwear", 2, {
            quantityRule: "everyTwoDays",
            minQuantity: 1,
            maxQuantity: 6,
        }),
    ],

    rainy: [
        item("umbrella", "Umbrella", "Weather", 1),
        item("waterproof-jacket", "Waterproof jacket", "Weather", 1),
        item("waterproof-shoes", "Waterproof shoes", "Footwear", 1),
        item("dry-bag", "Dry bag", "Weather", 1),
    ],

    hot: [
        item("high-spf-sunscreen", "High SPF sunscreen", "Weather", 1),
        item("cap-or-sun-hat", "Cap or sun hat", "Weather", 1),
        item("linen-or-light-shirts", "Linen or light shirts", "Clothing", 3, {
            quantityRule: "everyTwoDays",
            minQuantity: 2,
            maxQuantity: 7,
        }),
        item("after-sun-lotion", "After-sun lotion", "Toiletries", 1),
    ],
};

export const tripTypeSuggestions: Record<string, PackingTemplateItem[]> = {
    beach: [
        item("swimsuit", "Swimsuit", "Beach & Swim", 2),
        item("beach-towel", "Beach towel", "Beach & Swim", 1),
        item("flip-flops", "Flip-flops", "Footwear", 1),
        item("waterproof-phone-pouch", "Waterproof phone pouch", "Beach & Swim", 1),
        item("beach-bag", "Beach bag", "Beach & Swim", 1),
    ],

    hiking: [
        item("hiking-boots", "Hiking boots", "Outdoor & Hiking", 1, { protected: true }),
        item("daypack", "Daypack", "Outdoor & Hiking", 1),
        item("hiking-socks", "Hiking socks", "Outdoor & Hiking", 2, {
            quantityRule: "perDay",
            minQuantity: 1,
            maxQuantity: 7,
        }),
        item("quick-dry-shirt", "Quick-dry shirt", "Outdoor & Hiking", 2, {
            quantityRule: "everyTwoDays",
            minQuantity: 1,
            maxQuantity: 5,
        }),
        item("trail-snacks", "Trail snacks", "Outdoor & Hiking", 1),
        item("headlamp", "Headlamp", "Outdoor & Hiking", 1),
        item("map-or-offline-navigation", "Map or offline navigation", "Outdoor & Hiking", 1, { protected: true }),
    ],

    mountain: [
        item("insulating-mid-layer", "Insulating mid-layer", "Outdoor & Hiking", 1),
        item("windproof-shell", "Windproof shell", "Weather", 1),
        item("trekking-poles", "Trekking poles", "Outdoor & Hiking", 1),
        item("altitude-medication-if-needed", "Altitude medication if needed", "Health & Safety", 1),
    ],

    city: [
        item("smart-casual-outfit", "Smart casual outfit", "City & Business", 1),
        item("small-crossbody-bag", "Small crossbody bag", "City & Business", 1),
        item("portable-tote-bag", "Portable tote bag", "City & Business", 1),
        item("evening-shoes", "Evening shoes", "Footwear", 1),
    ],

    business: [
        item("business-outfit", "Business outfit", "City & Business", 1, {
            quantityRule: "onePerOutfitDay",
            minQuantity: 1,
            maxQuantity: 5,
        }),
        item("laptop", "Laptop", "Tech", 1, { protected: true }),
        item("laptop-charger", "Laptop charger", "Tech", 1, { protected: true }),
        item("notebook-and-pen", "Notebook and pen", "City & Business", 1),
    ],

    family: [
        item("kids-documents", "Kids’ documents", "Documents & Money", 1, { protected: true }),
        item("small-toys-or-books", "Small toys or books", "Comfort & Travel", 2),
        item("wet-wipes", "Wet wipes", "Health & Safety", 1),
        item("extra-snacks", "Extra snacks", "Comfort & Travel", 1),
    ],
};

export function getSmartQuantity(
    item: PackingTemplateItem,
    tripDays: number
): number {
    const days = Math.max(1, Math.ceil(tripDays));
    const min = item.minQuantity ?? 1;
    const max = item.maxQuantity ?? Number.POSITIVE_INFINITY;

    const clamp = (value: number) => Math.min(Math.max(value, min), max);

    switch (item.quantityRule) {
        case "perDay":
            return clamp(days);

        case "perNight":
            return clamp(Math.max(1, days - 1));

        case "tripDaysMinusOne":
            return clamp(Math.max(1, days - 1));

        case "everyTwoDays":
            return clamp(Math.ceil(days / 2));

        case "weekly":
            return clamp(Math.ceil(days / 7) + 1);

        case "onePerOutfitDay":
            return clamp(Math.min(days, item.maxQuantity ?? 5));

        case "fixed":
        default:
            return item.quantity;
    }
}

export function mergePackingItems(
    groups: PackingTemplateItem[][]
): PackingTemplateItem[] {
    const seen = new Set<string>();
    return groups.flat().filter((item) => {
        if (seen.has(item.key)) return false;
        seen.add(item.key);
        return true;
    });
}

export function createKey(category: string, name: string) {
    return `${category}-${name}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
}