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
}: {
    tripDays: number;
}): KidsStarterItem[] {
    const days = Math.max(1, Math.ceil(tripDays));

    const socksAndUnderwear = clamp(days + 2, 3, 18);
    const tops = clamp(days + 2, 3, 18);
    const bottoms = clamp(Math.ceil(days / 2) + 2, 3, 10);
    const spareOutfits = clamp(Math.ceil(days / 4), 1, 4);
    const pajamas = clamp(Math.ceil(days / 5) + 1, 2, 5);
    const travelSnacks = clamp(Math.ceil(days / 3), 1, 7);

    return [
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
}

export const kidsStarterItems = getKidsStarterItems({
    tripDays: 3,
});