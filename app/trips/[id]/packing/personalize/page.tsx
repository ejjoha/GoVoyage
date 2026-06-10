export default function PersonalizePackingPage() {
    return (
        <main className="min-h-screen bg-[#f6f1e8]">
            <div className="mx-auto max-w-md px-5 py-8">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-950">
                    Personalize Trip
                </h1>

                <div className="mt-6 rounded-3xl bg-indigo-50 p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                        Your recommendations are based on
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <div className="rounded-full bg-white px-3 py-2 text-sm font-medium text-indigo-900">
                            📍 Barcelona
                        </div>

                        <div className="rounded-full bg-white px-3 py-2 text-sm font-medium text-indigo-900">
                            ☀️ June Weather
                        </div>

                        <div className="rounded-full bg-white px-3 py-2 text-sm font-medium text-indigo-900">
                            📅 7 Days
                        </div>
                    </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
                    {[
                        ["🧳", "Luggage", "Carry-on"],
                        ["🏖️", "Activities", "Beach, Nightlife"],
                        ["🧺", "Laundry", "Available"],
                        ["⚖️", "Packing Preference", "Balanced"],
                        ["⚙️", "Advanced", "Coming soon"],
                    ].map(([icon, title, value], index, rows) => (
                        <button
                            key={title}
                            type="button"
                            className="flex w-full items-center gap-4 px-5 py-4 text-left transition active:bg-neutral-50"
                        >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-xl">
                                {icon}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-base font-semibold text-neutral-950">
                                    {title}
                                </p>

                                <p className="truncate text-sm text-neutral-500">
                                    {value}
                                </p>

                                {index !== rows.length - 1 && (
                                    <div className="mt-4 h-px bg-neutral-100" />
                                )}
                            </div>

                            <span className="text-xl text-neutral-300">›</span>
                        </button>
                    ))}
                </div>

                <p className="mt-7 text-center text-sm leading-6 text-neutral-500">
                    Changes will update your packing list.
                </p>
            </div>
        </main>
    );
}