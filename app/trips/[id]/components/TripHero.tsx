type TripHeroProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  imageUrl?: string;
};

export default function TripHero({
  title,
  subtitle,
  eyebrow,
  imageUrl,
}: TripHeroProps) {
  if (!imageUrl) return null;

  return (
    <div className="relative mb-6 w-full overflow-hidden rounded-3xl shadow-md">
      <img
        src={imageUrl}
        alt={title}
        className="h-56 w-full object-cover sm:h-72"
      />

      <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/30 bg-black/10 p-4 text-white backdrop-blur-md">
        {eyebrow && (
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/80">
            {eyebrow}
          </p>
        )}

        <h1 className="text-3xl font-bold leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1 text-sm text-white/90">{subtitle}</p>
        )}
      </div>
    </div>
  );
}