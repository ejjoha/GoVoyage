import type { PackingListItem } from "../types/packing.types";

export type KidsAgeGroup =
    | "baby"
    | "toddler"
    | "child"
    | "teen";

type KidsStarterItem = {
    name: string;
    category: string;
    quantity: number;
    source: "suggested";
    packed: boolean;
    hidden: boolean;
    protected: boolean;
};

function kidsItem({
    name,
    category,
    quantity = 1,
    protected: isProtected = false,
}: {
    name: string;
    category: string;
    quantity?: number;
    protected?: boolean;
}): KidsStarterItem {
    return {
        name,
        category,
        quantity,
        source: "suggested",
        packed: false,
        hidden: false,
        protected: isProtected,
    };
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export function getKidsStarterItems({
    tripDays,
    ageGroup = "child",
    climate = [],
}: {
    tripDays: number;
    ageGroup?: KidsAgeGroup;
    climate?: string[];
}): KidsStarterItem[] {
    const days = Math.max(1, Math.ceil(tripDays));

    const socksAndUnderwear = clamp(days + 2, 3, 18);
    const tops = clamp(days + 2, 3, 18);
    const bottoms = clamp(Math.ceil(days / 2) + 2, 3, 10);
    const spareOutfits = clamp(Math.ceil(days / 4), 1, 4);
    const pajamas = clamp(Math.ceil(days / 5) + 1, 2, 5);
    const travelSnacks = clamp(Math.ceil(days / 3), 1, 7);

    const baseItems: KidsStarterItem[] = [
        kidsItem({
            name: "Kids' passports or IDs",
            category: "Kids Documents",
            protected: true,
        }),
        kidsItem({
            name: "Kids' insurance cards",
            category: "Kids Documents",
            protected: true,
        }),
        kidsItem({
            name: "Boarding passes or travel documents",
            category: "Kids Documents",
            protected: true,
        }),
        kidsItem({
            name: "Emergency contacts",
            category: "Kids Documents",
            protected: true,
        }),
        kidsItem({
            name: "Consent letter if needed",
            category: "Kids Documents",
        }),

        kidsItem({
            name: "Kids' toothbrushes",
            category: "Kids Toiletries",
        }),
        kidsItem({
            name: "Kids' toothpaste",
            category: "Kids Toiletries",
        }),
        kidsItem({
            name: "Kids' shampoo or body wash",
            category: "Kids Toiletries",
        }),
        kidsItem({
            name: "Hairbrush or comb",
            category: "Kids Toiletries",
        }),
        kidsItem({
            name: "Wet wipes",
            category: "Kids Toiletries",
        }),
        kidsItem({
            name: "Hand sanitizer",
            category: "Kids Toiletries",
        }),
        kidsItem({
            name: "Tissues",
            category: "Kids Toiletries",
        }),
        kidsItem({
            name: "Lip balm",
            category: "Kids Toiletries",
        }),

        kidsItem({
            name: "Kids' tops or shirts",
            category: "Kids Clothing",
            quantity: tops,
        }),
        kidsItem({
            name: "Kids' bottoms",
            category: "Kids Clothing",
            quantity: bottoms,
        }),
        kidsItem({
            name: "Spare outfit set",
            category: "Kids Clothing",
            quantity: spareOutfits,
        }),
        kidsItem({
            name: "Kids' pajamas",
            category: "Kids Clothing",
            quantity: pajamas,
        }),
        kidsItem({
            name: "Kids' socks",
            category: "Kids Clothing",
            quantity: socksAndUnderwear,
        }),
        kidsItem({
            name: "Kids' underwear",
            category: "Kids Clothing",
            quantity: socksAndUnderwear,
        }),
        kidsItem({
            name: "Light sweater or hoodie",
            category: "Kids Clothing",
        }),
        kidsItem({
            name: "Comfortable shoes",
            category: "Kids Clothing",
        }),

        kidsItem({
            name: "Favorite toy or comfort item",
            category: "Kids Comfort",
            protected: true,
        }),
        kidsItem({
            name: "Small blanket",
            category: "Kids Comfort",
        }),
        kidsItem({
            name: "Sleep comfort item",
            category: "Kids Comfort",
        }),
        kidsItem({
            name: "Kids' water bottle",
            category: "Kids Comfort",
        }),

        kidsItem({
            name: "Travel snacks",
            category: "Kids Food & Day Bag",
            quantity: travelSnacks,
        }),
        kidsItem({
            name: "Refillable snack container",
            category: "Kids Food & Day Bag",
        }),
        kidsItem({
            name: "Small day bag",
            category: "Kids Food & Day Bag",
        }),

        kidsItem({
            name: "Tablet or entertainment",
            category: "Kids Entertainment",
        }),
        kidsItem({
            name: "Kids' headphones",
            category: "Kids Entertainment",
        }),
        kidsItem({
            name: "Coloring book or travel game",
            category: "Kids Entertainment",
        }),
        kidsItem({
            name: "Books or activity cards",
            category: "Kids Entertainment",
        }),
        kidsItem({
            name: "Chargers or power bank",
            category: "Kids Entertainment",
        }),

        kidsItem({
            name: "Kids' medicine",
            category: "Kids Health",
            protected: true,
        }),
        kidsItem({
            name: "Prescription medicine",
            category: "Kids Health",
            protected: true,
        }),
        kidsItem({
            name: "Fever medicine",
            category: "Kids Health",
        }),
        kidsItem({
            name: "Band-aids",
            category: "Kids Health",
        }),
        kidsItem({
            name: "Thermometer",
            category: "Kids Health",
        }),
        kidsItem({
            name: "Kids' sunscreen",
            category: "Kids Health",
        }),

        kidsItem({
            name: "Plastic bags for dirty or wet clothes",
            category: "Kids Practical",
        }),
        kidsItem({
            name: "Laundry bag",
            category: "Kids Practical",
        }),
        kidsItem({
            name: "Ziplock bags",
            category: "Kids Practical",
        }),
    ];

    const babyItems: KidsStarterItem[] = [
        kidsItem({
            name: "Diapers",
            category: "Baby Essentials",
            quantity: clamp(days * 6, 12, 90),
        }),
        kidsItem({
            name: "Diaper cream",
            category: "Baby Essentials",
        }),
        kidsItem({
            name: "Changing pad",
            category: "Baby Essentials",
        }),
        kidsItem({
            name: "Baby wipes",
            category: "Baby Essentials",
            quantity: clamp(Math.ceil(days / 3), 1, 8),
        }),
        kidsItem({
            name: "Bottles or sippy cups",
            category: "Baby Food",
            quantity: 2,
        }),
        kidsItem({
            name: "Formula or baby food",
            category: "Baby Food",
        }),
        kidsItem({
            name: "Bibs",
            category: "Baby Food",
            quantity: clamp(Math.ceil(days / 2), 2, 8),
        }),
        kidsItem({
            name: "Stroller",
            category: "Baby Travel Gear",
        }),
        kidsItem({
            name: "Stroller rain cover",
            category: "Baby Travel Gear",
        }),
    ];

    const toddlerItems: KidsStarterItem[] = [
        kidsItem({
            name: "Pull-ups if needed",
            category: "Toddler Essentials",
            quantity: clamp(days * 3, 6, 45),
        }),
        kidsItem({
            name: "Portable potty seat",
            category: "Toddler Essentials",
        }),
        kidsItem({
            name: "Snack cup",
            category: "Toddler Food",
        }),
        kidsItem({
            name: "Spill-proof cup",
            category: "Toddler Food",
        }),
        kidsItem({
            name: "Small toys",
            category: "Toddler Entertainment",
            quantity: 2,
        }),
        kidsItem({
            name: "Stroller or carrier",
            category: "Toddler Travel Gear",
        }),
    ];

    const childItems: KidsStarterItem[] = [
        kidsItem({
            name: "Small toy or game",
            category: "Kids Entertainment",
        }),
        kidsItem({
            name: "Extra activity book",
            category: "Kids Entertainment",
        }),
        kidsItem({
            name: "Cap or sun hat",
            category: "Kids Clothing",
        }),
    ];

    const teenItems: KidsStarterItem[] = [
        kidsItem({
            name: "Personal toiletries",
            category: "Teen Toiletries",
        }),
        kidsItem({
            name: "Phone charger",
            category: "Teen Tech",
            protected: true,
        }),
        kidsItem({
            name: "Power bank",
            category: "Teen Tech",
        }),
        kidsItem({
            name: "Extra hoodie",
            category: "Teen Clothing",
        }),
        kidsItem({
            name: "Personal day bag",
            category: "Teen Day Bag",
        }),
    ];

    const climateItems: KidsStarterItem[] = [];

    const hasClimate = (value: string) => climate.includes(value);

    if (
        hasClimate("Hot weather") ||
        hasClimate("Warm") ||
        hasClimate("Humid") ||
        hasClimate("Dry")
    ) {
        climateItems.push(
            kidsItem({
                name: "Kids' sun hat",
                category: "Kids Weather",
            }),
            kidsItem({
                name: "Kids' sunglasses",
                category: "Kids Weather",
            }),
            kidsItem({
                name: "Kids' swimwear",
                category: "Kids Weather",
                quantity: clamp(Math.ceil(days / 4), 1, 4),
            }),
            kidsItem({
                name: "After-sun lotion",
                category: "Kids Weather",
            })
        );
    }

    if (hasClimate("Rainy")) {
        climateItems.push(
            kidsItem({
                name: "Kids' rain jacket",
                category: "Kids Weather",
            }),
            kidsItem({
                name: "Waterproof shoes",
                category: "Kids Weather",
            }),
            kidsItem({
                name: "Extra socks for wet days",
                category: "Kids Weather",
                quantity: clamp(Math.ceil(days / 3), 1, 6),
            })
        );
    }

    if (hasClimate("Cold weather") || hasClimate("Freezing") || hasClimate("Snowy")) {
        climateItems.push(
            kidsItem({
                name: "Warm hat",
                category: "Kids Weather",
            }),
            kidsItem({
                name: "Gloves or mittens",
                category: "Kids Weather",
            }),
            kidsItem({
                name: "Thermal base layer",
                category: "Kids Weather",
                quantity: clamp(Math.ceil(days / 3), 1, 5),
            }),
            kidsItem({
                name: "Warm socks",
                category: "Kids Weather",
                quantity: clamp(Math.ceil(days / 3), 1, 6),
            })
        );
    }

    if (hasClimate("Windy") || hasClimate("Mountains")) {
        climateItems.push(
            kidsItem({
                name: "Windbreaker",
                category: "Kids Weather",
            }),
            kidsItem({
                name: "Extra warm layer",
                category: "Kids Weather",
            })
        );
    }

    switch (ageGroup) {
        case "baby":
            return [...baseItems, ...babyItems, ...climateItems];

        case "toddler":
            return [...baseItems, ...toddlerItems, ...climateItems];

        case "teen":
            return [...baseItems, ...teenItems, ...climateItems];

        case "child":
        default:
            return [...baseItems, ...childItems, ...climateItems];
    }
}

function normalizeName(name: string) {
    return name.trim().toLowerCase();
}

export function getKidsClimatePackingItems({
    tripDays,
    ageGroup = "child",
    climate,
    existingItems,
}: {
    tripDays: number;
    ageGroup?: KidsAgeGroup;
    climate: string[];
    existingItems: PackingListItem[];
}) {
    const existingNames = new Set(
        existingItems.map((item) => normalizeName(item.name))
    );

    const generatedNames = new Set<string>();

    return getKidsStarterItems({
        tripDays,
        ageGroup,
        climate,
    })
        .filter((item) => item.category === "Kids Weather")
        .filter((item) => {
            const normalized = normalizeName(item.name);

            if (existingNames.has(normalized)) return false;
            if (generatedNames.has(normalized)) return false;

            generatedNames.add(normalized);
            return true;
        });
}

export const kidsStarterItems = getKidsStarterItems({
    tripDays: 3,
    ageGroup: "child",
});