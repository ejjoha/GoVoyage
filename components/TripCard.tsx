import Link from "next/link";
import type { Trip } from "@/types/trip";
import { formatTripDateRange } from "@/utils/date";

export function TripCard({ trip }: { trip: Trip }) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group block overflow-hidden rounded-[2rem] border border-stone-200/60 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(0,0,0,0.10)] active:scale-[0.98]"
    >
      {trip.image_url ? (
        <div className="relative h-56 w-full overflow-hidden">
          <img
            src={trip.image_url}
            alt={trip.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div className="inline-flex rounded-full border border-white/40 bg-white/85 px-3 py-1.5 text-xs font-semibold text-stone-700 backdrop-blur-sm">
              {trip.destination}
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-stone-700 shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:translate-x-0.5">
              <img
                src="/icons/arrow-right.svg"
                alt=""
                className="h-5 w-5 opacity-80"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-rose-100 via-rose-200 to-pink-300">
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div className="inline-flex rounded-full border border-white/40 bg-white/85 px-3 py-1.5 text-xs font-semibold text-stone-700 backdrop-blur-sm">
              {trip.destination}
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-stone-700 shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:translate-x-0.5">
              <img
                src="/icons/arrow-right.svg"
                alt=""
                className="h-5 w-5 opacity-80"
              />
            </div>
          </div>
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-[1.35rem] font-semibold tracking-[-0.02em] text-stone-900">
              {trip.title}
            </h2>

            <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-stone-400">
              <img
                src="/icons/calendar.svg"
                alt=""
                className="h-4 w-4 opacity-70"
              />

              <span>
                {formatTripDateRange(trip.start_date, trip.end_date)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}