type PackProfileCardProps = {
    name: string;
    type: string;
};

export default function PackProfileCard({ name, type }: PackProfileCardProps) {
    return (
        <div className="mb-3 rounded-3xl bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
                        Packing profile
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-neutral-950">
                        {name || "My Packing List"}
                    </h2>
                </div>

                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold capitalize text-rose-500">
                    {type || "personal"}
                </span>
            </div>
        </div>
    );
}