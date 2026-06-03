// app/trips/[id]/cost-sharing/components/ExpensePageSkeleton.tsx

export default function ExpensePageSkeleton() {
    return (
        <main className="mx-auto min-h-screen max-w-2xl px-4 py-6 animate-pulse">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-[2rem]">
                <div className="h-[260px] rounded-[2rem] bg-stone-200" />

                <div className="absolute bottom-4 left-4 right-4">
                    <div className="h-4 w-24 rounded bg-stone-300" />
                    <div className="mt-3 h-8 w-56 rounded bg-stone-300" />
                    <div className="mt-2 h-4 w-40 rounded bg-stone-300" />
                </div>
            </div>

            {/* Floating card */}
            <div className="relative z-20 mx-4 -mt-10 rounded-[1.5rem] bg-white p-4 shadow-lg">
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="flex flex-col items-center">
                            <div className="h-8 w-8 rounded-full bg-stone-200" />
                            <div className="mt-3 h-3 w-16 rounded bg-stone-200" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Expenses section */}
            <div className="mt-10 rounded-[1.25rem] bg-white p-4">
                <div className="h-5 w-24 rounded bg-stone-200" />

                <div className="mt-4 space-y-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-16 rounded-2xl border border-stone-200 bg-stone-50"
                        />
                    ))}
                </div>
            </div>

            {/* Who owes section */}
            <div className="mt-6">
                <div className="h-6 w-32 rounded bg-stone-200" />
                <div className="mt-2 h-3 w-40 rounded bg-stone-200" />

                <div className="mt-4 space-y-3">
                    {[1, 2].map((item) => (
                        <div
                            key={item}
                            className="h-24 rounded-2xl border border-stone-200 bg-white"
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}