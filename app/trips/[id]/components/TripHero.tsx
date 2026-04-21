import Link from "next/link";

type TripStat = {
  label: string;
  value: string;
};

type TripHeroProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  imageUrl?: string;
  onEdit?: () => void;
  backHref?: string;
  stats?: TripStat[];
};

export default function TripHero({
  title,
  subtitle,
  eyebrow,
  imageUrl,
  onEdit,
  backHref,
  stats = [],
}: TripHeroProps) {
  return (
    <div className="relative mb-6 w-full overflow-hidden rounded-[2rem] border border-stone-200/60 bg-stone-900 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt={title}
            className="h-64 w-full object-cover sm:h-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
        </>
      ) : (
        <div className="h-64 w-full bg-gradient-to-br from-stone-900 via-stone-800 to-rose-900/70 sm:h-80" />
      )}

      <div className="absolute left-3 top-3 right-3 z-20 flex items-center justify-between sm:left-5 sm:right-5 sm:top-5">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Back to trips"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-black/35 px-4 text-sm font-medium text-white shadow-[0_6px_20px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-200 hover:scale-[1.02] hover:bg-black/45 active:scale-[0.98]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </Link>
        ) : (
          <div />
        )}

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit trip"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-black/35 px-4 text-sm font-medium text-white shadow-[0_6px_20px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-200 hover:scale-[1.02] hover:bg-black/45 active:scale-[0.98]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a2.25 2.25 0 1 1 3.182 3.182L10.582 17.13a4.5 4.5 0 0 1-1.897 1.13L6 19l.74-2.685a4.5 4.5 0 0 1 1.13-1.897L16.862 4.487Z"
              />
            </svg>
            <span>Edit trip</span>
          </button>
        )}
      </div>

      <div className="absolute inset-x-3 bottom-3 z-20 sm:inset-x-5 sm:bottom-5">
        <div className="rounded-[1.75rem] border border-white/20 bg-white/12 p-5 text-white backdrop-blur-md sm:p-6">
          <div className="max-w-xl">
            {eyebrow && (
              <p className="text-sm font-medium text-white/80">{eyebrow}</p>
            )}

            <h1 className="mt-1 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-2 text-sm font-medium text-white/90 sm:text-base">
                {subtitle}
              </p>
            )}
          </div>

          {stats.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2.5">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-sm text-white/95"
                >
                  <span className="font-semibold">{stat.value}</span>
                  <span className="ml-1.5 text-white/75">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}