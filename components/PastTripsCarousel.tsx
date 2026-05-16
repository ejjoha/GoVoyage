"use client";

import useEmblaCarousel from "embla-carousel-react";
import type { Trip } from "@/types/trip";
import { PastTripCard } from "@/components/PastTripCard";

type Props = {
    trips: Trip[];
};

export function PastTripsCarousel({ trips }: Props) {
    const [emblaRef] = useEmblaCarousel({
        align: "start",
        dragFree: true,
    });

    return (
        <div
            className="w-full min-w-0 overflow-hidden"
            style={{ maxWidth: "calc(100vw - 2rem)" }}
        >
            <div className="w-full min-w-0 overflow-hidden" ref={emblaRef}>
                <div className="flex gap-4">
                    {trips.map((trip) => (
                        <div
                            key={trip.id}
                            className="min-w-0 shrink-0"
                            style={{ flexBasis: "210px" }}
                        >
                            <PastTripCard trip={trip} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}