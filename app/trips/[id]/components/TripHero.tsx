import Link from "next/link";

type TripStat = {
  label: string;
  value: string;
  onClick?: () => void;
  ariaLabel?: string;
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
    <div className="relative mb-5 w-full overflow-hidden rounded-[2rem] shadow-md">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="h-[300px] w-full object-cover sm:h-[360px]"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

      <div className="absolute left-3 top-3 right-3 z-30 flex justify-between">
        {backHref ? (
          <Link
            href={backHref}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition active:scale-95"
            aria-label="Back"
          >
            <img
              src="/icons/back.svg"
              alt="Back"
              className="h-5 w-5 opacity-80"
            />
          </Link>
        ) : (
          <div />
        )}
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-20 rounded-2xl border border-white/20 bg-white/15 p-3 backdrop-blur-md shadow-[0_10px_34px_rgba(0,0,0,0.22)]">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit trip"
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center transition active:scale-95"
          >
            <img
              src="/icons/insideedit.svg"
              alt="Edit"
              className="h-5 w-5 opacity-90"
            />
          </button>
        )}

        {eyebrow && <p className="text-sm text-white/80">{eyebrow}</p>}

        <h1 className="pr-10 text-2xl font-bold text-white sm:text-3xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1 text-sm text-white/90">{subtitle}</p>
        )}

        {stats.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {stats.map((stat) =>
              stat.onClick ? (
                <button
                  key={stat.label}
                  type="button"
                  onClick={stat.onClick}
                  aria-label={stat.ariaLabel || `${stat.label}: ${stat.value}`}
                  className="rounded-full bg-white/20 px-3 py-1.5 text-xs text-white backdrop-blur-sm transition hover:bg-white/25 active:scale-95 cursor-pointer"
                >
                  <span className="font-semibold">{stat.value}</span>{" "}
                  {stat.label}
                </button>
              ) : (
                <div
                  key={stat.label}
                  className="rounded-full bg-white/20 px-3 py-1.5 text-xs text-white backdrop-blur-sm"
                >
                  <span className="font-semibold">{stat.value}</span>{" "}
                  {stat.label}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}