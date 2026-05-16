import type { Trip } from "@/types/trip";
import Link from "next/link";
import { formatTripDateRange } from "@/utils/date";

export function PastTripCard({ trip }: { trip: Trip }) {
    return (
        <Link
            href={`/trips/${trip.id}`}
            className="group block w-full overflow-hidden rounded-[1.75rem] border border-stone-200/60 bg-white/90 shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] active:scale-[0.985]"
        >
            {trip.image_url ? (
                <div className="relative h-32 w-full overflow-hidden">
                    <img
                        src={trip.image_url}
                        alt={trip.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                        <div className="inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-stone-700 backdrop-blur-sm">
                            {trip.destination}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border-b border-stone-100 bg-stone-50 px-5 py-4">
                    <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600 shadow-sm">
                        {trip.destination}
                    </div>
                </div>
            )}

            <div className="p-3.5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-medium text-stone-800">
                            {trip.title}
                        </h2>

                        <p className="mt-1 text-sm text-stone-500">
                            {formatTripDateRange(trip.start_date, trip.end_date)}
                        </p>
                    </div>

                    <div className="shrink-0 text-stone-300 transition-colors group-hover:text-stone-500">
                        →
                    </div>
                </div>
            </div>
        </Link>
    );
}