export type PackingItem = {
    key: string;
    name: string;
    category: string;
    packed: boolean;
    quantity: number;
    protected?: boolean;
    hidden?: boolean;
    source: "suggested" | "custom" | "personal";
};

export const packingCategories = [
    "Essentials",
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
    "Kids & Family",
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
    item("passport-or-id", "Passport or ID", "Essentials", 1, { protected: true }),
    item("wallet", "Wallet", "Essentials", 1, { protected: true }),
    item("payment-card", "Payment card", "Essentials", 1, { protected: true }),
    item("travel-insurance-info", "Travel insurance info", "Essentials", 1, { protected: true }),
    item("booking-confirmations", "Booking confirmations", "Essentials", 1, { protected: true }),
    item("house-keys", "House keys", "Essentials", 1, { protected: true }),

    item("phone", "Phone", "Tech", 1, { protected: true }),
    item("phone-charger", "Phone charger", "Tech", 1, { protected: true }),
    item("power-bank", "Power bank", "Tech", 1),
    item("travel-adapter", "Travel adapter", "Tech", 1),

    item("underwear", "Underwear", "Clothing", 3, {
        quantityRule: "perDay",
        minQuantity: 2,
    }),
    item("socks", "Socks", "Clothing", 3, {
        quantityRule: "perDay",
        minQuantity: 2,
    }),
    item("t-shirts-or-tops", "T-shirts or tops", "Clothing", 3, {
        quantityRule: "perDay",
        minQuantity: 2,
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
    item("sanitary-products", "Sanitary products", "Toiletries", 1, {
        protected: true,
    }),
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

export function getEssentialsStarterItems() {
    return [
        {
            name: "Passport or ID",
            category: "Essentials",
            quantity: 1,
            source: "suggested" as const,
            packed: false,
            hidden: false,
            protected: true,
        },
        {
            name: "Wallet",
            category: "Essentials",
            quantity: 1,
            source: "suggested" as const,
            packed: false,
            hidden: false,
            protected: true,
        },
        {
            name: "Payment card",
            category: "Essentials",
            quantity: 1,
            source: "suggested" as const,
            packed: false,
            hidden: false,
            protected: true,
        },
        {
            name: "Travel insurance info",
            category: "Essentials",
            quantity: 1,
            source: "suggested" as const,
            packed: false,
            hidden: false,
            protected: true,
        },
        {
            name: "Booking confirmations",
            category: "Essentials",
            quantity: 1,
            source: "suggested" as const,
            packed: false,
            hidden: false,
            protected: true,
        },
        {
            name: "House keys",
            category: "Essentials",
            quantity: 1,
            source: "suggested" as const,
            packed: false,
            hidden: false,
            protected: true,
        },
        {
            name: "Phone",
            category: "Essentials",
            quantity: 1,
            source: "suggested" as const,
            packed: false,
            hidden: false,
            protected: true,
        },
        {
            name: "Phone charger",
            category: "Essentials",
            quantity: 1,
            source: "suggested" as const,
            packed: false,
            hidden: false,
            protected: true,
        },
        {
            name: "Prescription medicine",
            category: "Essentials",
            quantity: 1,
            source: "suggested" as const,
            packed: false,
            hidden: false,
            protected: true,
        },
    ];
}

export const environmentSuggestions: Record<string, PackingTemplateItem[]> = {
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
};

export const tripStyleSuggestions: Record<string, PackingTemplateItem[]> = {
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

    "traveling with kids": [
        item("kids-documents", "Kids’ documents", "Kids & Family", 1, { protected: true }),
        item("kids-passports-ids", "Passports/IDs", "Kids & Family", 1, { protected: true }),
        item("kids-boarding-passes", "Boarding passes", "Kids & Family", 1, { protected: true }),
        item("kids-insurance-cards", "Insurance cards", "Kids & Family", 1, { protected: true }),
        item("kids-consent-letter", "Consent letter (if needed)", "Kids & Family", 1),
        item("kids-emergency-contacts", "Emergency contacts", "Kids & Family", 1, { protected: true }),

        item("kids-snacks", "Snacks", "Kids & Family", 1),
        item("kids-refillable-water-bottles", "Refillable water bottles", "Kids & Family", 1),
        item("kids-spill-proof-snack-cups", "Spill-proof snack cups", "Kids & Family", 1),
        item("kids-ziplock-bags", "Ziplock bags", "Kids & Family", 1),

        item("kids-toys-books", "Toys/books", "Kids & Family", 1),
        item("kids-coloring-books-crayons", "Coloring books/crayons", "Kids & Family", 1),
        item("kids-sticker-books", "Sticker books", "Kids & Family", 1),
        item("kids-tablet-headphones", "Tablet + headphones", "Kids & Family", 1),
        item("kids-chargers-power-bank", "Chargers/power bank", "Kids & Family", 1),
        item("kids-favorite-stuffed-animal", "Favorite stuffed animal", "Kids & Family", 1),

        item("kids-wipes", "Wipes", "Kids & Family", 1),
        item("kids-hand-sanitizer", "Hand sanitizer", "Kids & Family", 1),
        item("kids-disinfecting-wipes", "Disinfecting wipes", "Kids & Family", 1),
        item("kids-tissues", "Tissues", "Kids & Family", 1),
        item("kids-plastic-bags", "Plastic bags for trash/dirty clothes", "Kids & Family", 1),

        item("kids-medication", "Medication", "Kids & Family", 1),
        item("kids-fever-medicine", "Fever medicine", "Kids & Family", 1),
        item("kids-band-aids", "Band-aids", "Kids & Family", 1),
        item("kids-prescription-meds", "Prescription meds", "Kids & Family", 1, { protected: true }),
        item("kids-thermometer", "Thermometer", "Kids & Family", 1),
        item("kids-sunscreen", "Sunscreen", "Kids & Family", 1),

        item("kids-spare-clothes", "Spare clothes", "Kids & Family", 1),
        item("kids-pajamas", "Pajamas", "Kids & Family", 1),
        item("kids-socks-underwear", "Socks/underwear", "Kids & Family", 1),
        item("kids-sweater-jacket", "Sweater/jacket", "Kids & Family", 1),
        item("parents-extra-shirt", "Extra shirt for parents", "Kids & Family", 1),

        item("kids-diapers-pull-ups", "Diapers/pull-ups", "Kids & Family", 1),
        item("kids-diaper-cream", "Diaper cream", "Kids & Family", 1),
        item("kids-changing-pad", "Changing pad", "Kids & Family", 1),
        item("kids-disposable-diaper-bags", "Disposable diaper bags", "Kids & Family", 1),
        item("kids-portable-potty-seat", "Portable potty seat", "Kids & Family", 1),

        item("kids-stroller-rain-cover", "Stroller rain cover", "Kids & Family", 1),
        item("kids-stroller-blanket", "Stroller blanket", "Kids & Family", 1),
        item("kids-stroller-fan", "Stroller fan", "Kids & Family", 1),
        item("kids-stroller-organizer-hooks", "Stroller organizer/hooks", "Kids & Family", 1),

        item("kids-car-seat", "Car seat", "Kids & Family", 1),
        item("kids-car-seat-travel-bag", "Car seat travel bag", "Kids & Family", 1),
        item("kids-window-shade", "Window shade", "Kids & Family", 1),
        item("kids-neck-pillow", "Neck pillow", "Kids & Family", 1),
        item("kids-blanket", "Blanket", "Kids & Family", 1),
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

export type LaundryAvailability =
    | "Available"
    | "Hotel service"
    | "Not available";

export function getLaundryAwareQuantity({
    item,
    tripDays,
    laundry,
}: {
    item: PackingTemplateItem;
    tripDays: number;
    laundry: LaundryAvailability;
}): number {
    const normalQuantity = getSmartQuantity(item, tripDays);

    if (laundry === "Not available") {
        return normalQuantity;
    }

    const laundrySensitiveRules = [
        "perDay",
        "perNight",
        "tripDaysMinusOne",
        "everyTwoDays",
        "onePerOutfitDay",
    ];

    if (!item.quantityRule || !laundrySensitiveRules.includes(item.quantityRule)) {
        return normalQuantity;
    }

    if (laundry === "Available") {
        return Math.max(item.minQuantity ?? 1, Math.ceil(normalQuantity * 0.45));
    }

    if (laundry === "Hotel service") {
        return Math.max(item.minQuantity ?? 1, Math.ceil(normalQuantity * 0.65));
    }

    return normalQuantity;
}

export type PackingPreference =
    | "Light"
    | "Balanced"
    | "Pack Everything";

export function getPreferenceAdjustedQuantity({
    quantity,
    preference,
}: {
    quantity: number;
    preference: PackingPreference;
}) {
    switch (preference) {
        case "Light":
            return Math.max(1, Math.ceil(quantity * 0.8));

        case "Pack Everything":
            return Math.ceil(quantity * 1.2);

        case "Balanced":
        default:
            return quantity;
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