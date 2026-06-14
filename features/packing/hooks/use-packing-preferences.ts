import { useEffect, useState } from "react";

type LaundryOption =
    | "Available"
    | "Hotel service"
    | "Not available";

type PackingPreference =
    | "Light"
    | "Balanced"
    | "Pack Everything";

function isLaundryOption(value: string | null): value is LaundryOption {
    return (
        value === "Available" ||
        value === "Hotel service" ||
        value === "Not available"
    );
}

function isPackingPreference(value: string | null): value is PackingPreference {
    return (
        value === "Light" ||
        value === "Balanced" ||
        value === "Pack Everything"
    );
}

export function usePackingPreferences({
    tripId,
    categoryModalOpen,
}: {
    tripId: number;
    categoryModalOpen: boolean;
}) {
    const [laundry] = useState<LaundryOption>(() => {
        if (typeof window === "undefined") return "Not available";

        const saved = localStorage.getItem(`packing-laundry-${tripId}`);

        return isLaundryOption(saved) ? saved : "Not available";
    });

    const [packingPreference, setPackingPreference] =
        useState<PackingPreference>("Balanced");

    const [activities, setActivities] = useState<string[]>([]);

    useEffect(() => {
        if (!categoryModalOpen) return;

        const saved = localStorage.getItem(`packing-activities-${tripId}`);

        if (!saved) {
            setActivities([]);
            return;
        }

        setActivities(JSON.parse(saved));
    }, [categoryModalOpen, tripId]);

    useEffect(() => {
        const saved = localStorage.getItem(
            `packing-preference-${tripId}`
        );

        if (isPackingPreference(saved)) {
            setPackingPreference(saved);
        }
    }, [tripId, categoryModalOpen]);

    return {
        laundry,
        packingPreference,
        activities,
    };
}