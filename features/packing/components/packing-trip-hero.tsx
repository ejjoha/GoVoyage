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

    const remainingCount = Math.max(totalCount - packedCount, 0);

    return (
        <section className="relative mb-15">
            <div className="relative -mx-4 -mt-6 overflow-hidden rounded-b-[2.75rem] bg-neutral-200">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="h-[20rem] w-full object-cover"
                    />
                ) : (
                    <div className="h-[22rem] w-full bg-gradient-to-br from-neutral-200 to-neutral-300" />
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/35" />

                <div className="absolute left-2 top-4">
                    <Link
                        href={`/trips/${tripId}`}
                        className="absolute left-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition active:scale-95"
                        aria-label="Back"
                    >
                        <img
                            src="/icons/arrow-left.svg"
                            alt=""
                            className="h-5 w-5 opacity-80"
                        />
                    </Link>
                </div>

                <div className="absolute inset-x-0 top-16 px-8 text-center text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/80">
                        Destination
                    </p>

                    <h1 className="mt-4 font-serif text-5xl font-semibold tracking-[-0.06em]">
                        {destination}
                    </h1>

                    <p className="mt-3 text-sm text-white/85">
                        {days} {days === 1 ? "day" : "days"} · {nights}{" "}
                        {nights === 1 ? "night" : "nights"}
                    </p>

                    <div className="mx-auto mt-2 grid max-w-sm grid-cols-3 items-center gap-6">
                        {typeof temperature === "number" && (
                            <div className="text-center">
                                <p className="text-lg font-bold">
                                    {Math.round(temperature)}°
                                </p>
                                <p className="mt-0 text-xs font-semibold text-white/85">
                                    Temp
                                </p>
                            </div>
                        )}

                        {weatherLabel && (
                            <div className="text-center">
                                <p className="text-md font-semibold tracking-[-0.03em]">
                                    {weatherLabel}
                                </p>
                            </div>
                        )}

                        {typeof rainChance === "number" && (
                            <div className="text-center">
                                <p className="text-lg font-bold">
                                    {rainChance}%
                                </p>
                                <p className="mt-0 text-xs font-semibold text-white/85">
                                    Rain
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="absolute inset-x-0 -bottom-12 px-1">
                <div className="rounded-[1.25rem] bg-white p-3 shadow-[0_14px_40px_rgba(0,0,0,0.10)]">
                    <div className="flex items-center gap-6">
                        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                            <svg
                                className="absolute inset-0 h-full w-full -rotate-90"
                                viewBox="0 0 100 100"
                            >
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    stroke="#ececec"
                                    strokeWidth="8"
                                    fill="none"
                                />

                                <circle
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    stroke="#ff2f68"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={`${progress * 2.64} 264`}
                                />
                            </svg>

                            <div className="text-center">
                                <p className="text-md font-bold text-neutral-950">
                                    {progress}%
                                </p>

                                <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                                    Packed
                                </p>
                            </div>
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-semibold tracking-[-0.03em] text-neutral-950">
                                You’re on your way!
                            </p>

                            <p className="mt-1 text-[12px] leading-4 text-neutral-500">
                                Keep going and you’ll be all set for your trip.
                            </p>
                        </div>
                    </div>


                </div>
            </div>
        </section>
    );
}