import Link from "next/link";

type TripHeroProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  imageUrl?: string;
  onEdit?: () => void;
  backHref?: string;
};

export default function TripHero({
  title,
  subtitle,
  eyebrow,
  imageUrl,
  onEdit,
  backHref,
}: TripHeroProps) {
  return (
    <div className="relative mb-6 w-full overflow-hidden rounded-3xl shadow-md">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="h-56 w-full object-cover sm:h-72"
        />
      )}

      {backHref && (
        <Link
          href={backHref}
          aria-label="Back to trip"
          className="absolute left-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white shadow-[0_6px_20px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-black/70 active:scale-95 sm:left-4 sm:top-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </Link>
      )}

      <div className="absolute bottom-4 left-3 right-3 min-w-0 rounded-3xl border border-white/30 bg-black/20 p-4 text-white backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-5 sm:p-5">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit trip"
            className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white shadow-[0_4px_14px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white/20 active:scale-95"
          >
            <img
              src="/icons/edit.svg"
              alt="Edit"
              className="h-5 w-5 translate-x-[2px] translate-y-[0.5px] opacity-90 transition-all duration-200"
            />
          </button>
        )}

        <div className="pr-14">
          <h1 className="text-2xl font-bold leading-tight drop-shadow sm:text-3xl">
            {title}
          </h1>

          {subtitle && <p className="mt-1 text-sm text-white/90">{subtitle}</p>}

          {eyebrow && <p className="text-xs text-white/80">{eyebrow}</p>}
        </div>
      </div>
    </div>
  );
}