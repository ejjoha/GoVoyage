import {
    PackingItem,
    baseItems,
    climateSuggestions,
    createKey,
    getSmartQuantity,
    environmentSuggestions,
    tripStyleSuggestions,
    mergePackingItems,
} from "./packingSuggestions";


export function generatePackingItems({
    selectedClimates,
    selectedEnvironments,
    selectedTripStyles,
    tripDays,
    currentItems,
    personalItems,
}: {
    selectedClimates: string[];
    selectedEnvironments: string[];
    selectedTripStyles: string[];
    tripDays: number;
    currentItems: PackingItem[];
    personalItems: PackingItem[];
}): PackingItem[] {
    const generatedItems = mergePackingItems([
        baseItems,
        personalItems,
        ...selectedClimates.map(
            (climate) => climateSuggestions[climate.toLowerCase()] || []
        ),
        ...selectedEnvironments.map(
            (environment) => environmentSuggestions[environment.toLowerCase()] || []
        ),

        ...selectedTripStyles.map(
            (style) => tripStyleSuggestions[style.toLowerCase()] || []
        ),
    ]).map((item) => ({
        ...item,
        key: createKey(item.category, item.name),
        quantity: getSmartQuantity(item, tripDays),
    }));

    const preservedItems = currentItems.filter(
        (item) => item.source === "custom" || item.protected || item.packed
    );

    const preservedGeneratedItems = generatedItems.map((generatedItem) => {
        const existingItem = currentItems.find(
            (item) =>
                createKey(item.category, item.name) ===
                createKey(generatedItem.category, generatedItem.name)
        );

        return existingItem
            ? {
                ...generatedItem,
                packed: existingItem.packed,
                quantity: existingItem.protected
                    ? existingItem.quantity
                    : generatedItem.quantity,
                protected: existingItem.protected,
            }
            : generatedItem;
    });

    const mergedItems = [...preservedGeneratedItems];

    preservedItems.forEach((preservedItem) => {
        const alreadyExists = mergedItems.some(
            (item) => item.key === preservedItem.key
        );

        if (!alreadyExists) {
            mergedItems.push(preservedItem);
        }
    });

    return mergedItems;
}