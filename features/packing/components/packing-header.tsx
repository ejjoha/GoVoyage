type Props = {
    title?: string;
    subtitle?: string;
    packedCount: number;
    totalCount: number;
};

export default function PackingHeader({
    title = "Packing",
    subtitle = "Prepare calmly, together.",
    packedCount,
    totalCount,
}: Props) {
    const progress =
        totalCount === 0 ? 0 : Math.round((packedCount / totalCount) * 100);

    return (
        <header className="mb-7">
            <div className="flex items-end justify-between gap-6">
                <div>
                    <p className="text-sm font-semibold text-neutral-500">
                        {subtitle}
                    </p>

                    <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-neutral-950">
                        {title}
                    </h1>
                </div>

                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full bg-white shadow-sm">
                    <span className="text-sm font-bold text-rose-500">
                        {progress}%
                    </span>
                    <span className="text-[11px] font-semibold text-neutral-400">
                        {packedCount}/{totalCount}
                    </span>
                </div>
            </div>
        </header>
    );
}