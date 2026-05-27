export function TripCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-stone-200/60 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-stone-100 via-stone-200 to-stone-100">
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div className="h-8 w-28 animate-pulse rounded-full bg-white/80" />

          <div className="h-10 w-10 animate-pulse rounded-full bg-white/80 shadow-sm" />
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="h-7 w-2/3 animate-pulse rounded-full bg-stone-200" />

        <div className="mt-3 flex items-center gap-2">
          <div className="h-4 w-4 animate-pulse rounded bg-stone-200" />
          <div className="h-4 w-32 animate-pulse rounded-full bg-stone-200" />
        </div>
      </div>
    </div>
  );
}