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
        containScroll: "trimSnaps",
        skipSnaps: true,
        duration: 28,
    });

    return (
        <div
            className="w-full min-w-0 overflow-hidden"
            style={{ maxWidth: "calc(100vw - 2rem)" }}
        >
            <div className="w-full min-w-0 overflow-hidden" ref={emblaRef}>
                <div className="flex gap-4 will-change-transform">
                    {trips.map((trip) => (
                        <div
                            key={trip.id}
                            className="min-w-0 shrink-0"
                            style={{ flexBasis: "280px" }}
                        >
                            <PastTripCard trip={trip} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}