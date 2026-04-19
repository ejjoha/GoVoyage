type TripHeroProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  imageUrl?: string;
  onEdit?: () => void;
};

export default function TripHero({
  title,
  subtitle,
  eyebrow,
  imageUrl,
  onEdit,
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

      <div className="absolute bottom-5 left-5 right-5 min-w-0 rounded-3xl border border-white/30 bg-black/20 p-4 text-white backdrop-blur-md sm:p-5">
        {onEdit && (
    <button
    type="button"
    onClick={onEdit}
    aria-label="Edit trip"
    className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-white transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95 shadow-[0_4px_14px_rgba(0,0,0,0.4)]"
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

          {subtitle && (
            <p className="mt-1 text-sm text-white/90">
              {subtitle}
            </p>
          )}

          {eyebrow && (
            <p className="text-xs text-white/80">
              {eyebrow}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}