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

function getWeatherInsight(weatherLabel?: string | null, rainChance?: number | null) {
    const label = weatherLabel?.toLowerCase() ?? "";

    if ((typeof rainChance === "number" && rainChance >= 50) || label.includes("rain") || label.includes("thunder")) {
        return {
            title: "Rain is likely",
            body: "Consider adding rainy-weather essentials before you go.",
            items: ["Rain jacket", "Waterproof pouch", "Extra socks"],
        };
    }

    if (label.includes("hot") || label.includes("sun") || label.includes("clear")) {
        return {
            title: "Warm weather expected",
            body: "Light clothing and sun protection will matter most.",
            items: ["Sunscreen", "Sunglasses", "Light clothing"],
        };
    }

    return {
        title: "Pack for the conditions",
        body: "Use the weather as a final check before closing your bags.",
        items: ["Comfortable layers", "Backup outfit", "Travel essentials"],
    };
}

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
    const insight = getWeatherInsight(weatherLabel, rainChance);

    return (
        <section className="mb-7">
            <div className="mb-7">
                <Link
                    href={`/trips/${tripId}`}
                    aria-label="Back to trip"
                    className="flex h-13 w-13 items-center justify-center rounded-full bg-white text-2xl shadow-sm transition active:scale-95"
                >
                    ←
                </Link>
            </div>

            <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-400">
                    {destination}
                </p>

                <h1 className="mt-2 text-5xl font-bold tracking-[-0.06em] text-neutral-950">
                    {title}
                </h1>

                <p className="mt-3 text-base font-semibold text-neutral-500">
                    {days} {days === 1 ? "day" : "days"} · {nights}{" "}
                    {nights === 1 ? "night" : "nights"}
                </p>
            </div>

            <div className="mt-7 rounded-[2rem] bg-white p-5 shadow-sm">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold text-neutral-400">Packing progress</p>
                        <p className="mt-1 text-3xl font-bold tracking-[-0.05em] text-neutral-950">
                            {progress}% packed
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-sm font-bold text-neutral-950">
                            {packedCount} packed
                        </p>
                        <p className="mt-1 text-sm font-semibold text-neutral-400">
                            {remainingCount} remaining
                        </p>
                    </div>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                        className="h-full rounded-full bg-rose-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="mt-4 rounded-[2rem] bg-neutral-950 p-5 text-white shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold text-white/50">Weather insight</p>
                        <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">
                            {insight.title}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-white/70">
                            {insight.body}
                        </p>
                    </div>

                    {typeof temperature === "number" && (
                        <div className="shrink-0 text-right">
                            <p className="text-3xl font-bold">{Math.round(temperature)}°</p>
                            {typeof rainChance === "number" && (
                                <p className="mt-1 text-xs font-bold text-white/50">
                                    {rainChance}% rain
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    {insight.items.map((item) => (
                        <span
                            key={item}
                            className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80"
                        >
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[2rem] bg-neutral-200 shadow-sm">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="h-36 w-full object-cover"
                    />
                ) : (
                    <div className="h-36 w-full bg-gradient-to-br from-neutral-200 to-neutral-300" />
                )}
            </div>
        </section>
    );
}