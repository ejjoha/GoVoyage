import type {
    PackingList,
    PackingListItem,
} from "../types/packing.types";

import {
    baseItems,
    climateSuggestions,
    environmentSuggestions,
    tripStyleSuggestions,
    getSmartQuantity,
    mergePackingItems,
} from "./packing-template-engine";

export type SmartSuggestionInput = {
    list: PackingList;
    tripDays: number;
    selectedClimates: string[];
    selectedEnvironments: string[];
    selectedTripStyles: string[];
};

function getBaseItemsForList(list: PackingList) {
    const title = list.title.toLowerCase();

    if (title.includes("kid")) {
        return tripStyleSuggestions["traveling with kids"] ?? [];
    }

    if (list.type === "luggage" || title.includes("carry")) {
        return baseItems.filter((item) =>
            [
                "Passport or ID",
                "Wallet",
                "Phone",
                "Phone charger",
                "Power bank",
                "Travel snacks",
                "Prescription medicine",
            ].includes(item.name)
        );
    }

    if (list.type === "shared") {
        return baseItems.filter((item) =>
            [
                "Travel adapter",
                "Basic first aid",
                "Travel snacks",
                "Laundry bag",
                "Reusable water bottle",
            ].includes(item.name)
        );
    }

    return baseItems;
}

export function getSuggestedItemsForList({
    list,
    tripDays,
    selectedClimates,
    selectedEnvironments,
    selectedTripStyles,
}: SmartSuggestionInput): Array<
    Pick<
        PackingListItem,
        "name" | "category" | "quantity" | "source" | "packed" | "hidden" | "protected"
    >
> {
    const generatedItems = mergePackingItems([
        getBaseItemsForList(list),
        ...selectedClimates.map(
            (climate) => climateSuggestions[climate.toLowerCase()] || []
        ),
        ...selectedEnvironments.map(
            (environment) => environmentSuggestions[environment.toLowerCase()] || []
        ),
        ...selectedTripStyles.map(
            (style) => tripStyleSuggestions[style.toLowerCase()] || []
        ),
    ]);

    return generatedItems.map((item) => ({
        name: item.name,
        category: item.category,
        quantity: getSmartQuantity(item, tripDays),
        source: "suggested",
        packed: false,
        hidden: false,
        protected: Boolean(item.protected),
    }));
}