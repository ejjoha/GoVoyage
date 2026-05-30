export default function PackingBoardSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="relative -mx-4 -mt-6 mb-10 h-[22rem] overflow-hidden rounded-b-[2.75rem] bg-neutral-200">
                <div className="absolute left-5 top-5 h-11 w-11 rounded-full bg-white/80" />
            </div>

            <div className="relative -mt-12 mb-5 px-1">
                <div className="rounded-[1.25rem] bg-white p-3 shadow-[0_14px_40px_rgba(0,0,0,0.10)]">
                    <div className="flex items-center gap-6">
                        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[8px] border-neutral-100">
                            <div className="h-10 w-10 rounded-full bg-neutral-100" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="h-4 w-36 rounded-full bg-neutral-100" />
                            <div className="mt-2 h-3 w-44 rounded-full bg-neutral-100" />
                            <div className="mt-1.5 h-3 w-32 rounded-full bg-neutral-100" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="-mx-4 mb-5 flex gap-2.5 overflow-hidden px-4">
                <div className="h-14 min-w-[8.5rem] rounded-[1rem] bg-white" />
                <div className="h-14 min-w-[8.5rem] rounded-[1rem] bg-white/60" />
                <div className="h-14 min-w-[8.5rem] rounded-[1rem] bg-white/60" />
            </div>

            <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="rounded-[1.25rem] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="h-5 w-28 rounded-full bg-neutral-100" />
                                <div className="mt-2 h-3 w-20 rounded-full bg-neutral-100" />
                            </div>

                            <div className="h-7 w-12 rounded-full bg-neutral-100" />
                        </div>

                        <div className="mt-5 space-y-4">
                            <div className="h-4 w-full rounded-full bg-neutral-100" />
                            <div className="h-4 w-5/6 rounded-full bg-neutral-100" />
                            <div className="h-4 w-2/3 rounded-full bg-neutral-100" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}