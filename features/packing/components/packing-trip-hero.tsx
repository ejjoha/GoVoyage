import Link from "next/link";

type Props = {
  tripId: number;
  title: string;
  destination: string;
  days: number;
  nights: number;
  imageUrl: string | null;
  temperature?: number | null;
  weatherLabel?: string | null;
  rainChance?: number | null;
  packedCount: number;
  totalCount: number;
};

export default function PackingTripHero({
  tripId,
  title,
  destination,
  days,
  nights,
  imageUrl,
  temperature,
  weatherLabel,
  rainChance,
  packedCount,
  totalCount,
}: Props) {
  const progress =
    totalCount === 0 ? 0 : Math.round((packedCount / totalCount) * 100);

  return (
    <section className="mb-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href={`/trips/${tripId}`}
          aria-label="Back to trip"
          className="flex h-13 w-13 items-center justify-center rounded-full bg-white text-2xl shadow-sm transition active:scale-95"
        >
          ←
        </Link>

        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full bg-white shadow-sm">
          <span className="text-sm font-bold text-rose-500">
            {progress}%
          </span>
          <span className="text-[11px] font-semibold text-neutral-400">
            {packedCount}/{totalCount}
          </span>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-sm font-semibold text-neutral-500">
          {destination}
        </p>

        <h1 className="mt-1 text-4xl font-bold tracking-[-0.04em] text-neutral-950">
          {title} Packing
        </h1>

        <p className="mt-3 text-sm font-medium text-neutral-500">
          {days} {days === 1 ? "day" : "days"} · {nights}{" "}
          {nights === 1 ? "night" : "nights"}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[2rem] bg-neutral-200 shadow-sm">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-44 w-full object-cover"
          />
        ) : (
          <div className="h-44 w-full bg-gradient-to-br from-neutral-200 to-neutral-300" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        <div className="absolute bottom-5 left-5 text-white">
          {typeof temperature === "number" && (
            <p className="text-3xl font-bold">
              {Math.round(temperature)}°
            </p>
          )}

          {weatherLabel && (
            <p className="mt-1 text-sm font-bold">
              {weatherLabel}
            </p>
          )}

          {typeof rainChance === "number" && (
            <p className="mt-1 text-sm font-medium text-white/90">
              {rainChance}% rain chance
            </p>
          )}
        </div>
      </div>
    </section>
  );
}