type TripSetupSheetProps = {
    onClose: () => void;
    onInviteTravellers: () => void;
    onChooseCurrencies: () => void;
    onStartPacking: () => void;
};

export default function TripSetupSheet({
    onClose,
    onInviteTravellers,
    onChooseCurrencies,
    onStartPacking,
}: TripSetupSheetProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pt-12 pb-6 backdrop-blur-[2px] sm:items-center sm:p-6"
            onClick={onClose}
        >
            <div
                className="sheet-up w-full max-w-md overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 pt-6 pb-5 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">
                        🎉
                    </div>

                    <h2 className="text-2xl font-semibold tracking-[-0.02em] text-stone-900">
                        Your trip is ready
                    </h2>

                    <p className="mt-2 text-sm text-stone-500">
                        Let's get everything set up.
                    </p>
                </div>

                <div className="px-4 pb-4 space-y-3">
                    <button
                        onClick={onInviteTravellers}
                        className="flex w-full items-center gap-4 rounded-2xl border border-stone-200 bg-white px-4 py-4 text-left transition hover:bg-stone-50"
                    >
                        <span className="text-2xl">👥</span>

                        <div>
                            <p className="font-semibold text-stone-900">
                                Invite travellers
                            </p>

                            <p className="text-sm text-stone-500">
                                Share the trip with friends and family
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={onChooseCurrencies}
                        className="flex w-full items-center gap-4 rounded-2xl border border-stone-200 bg-white px-4 py-4 text-left transition hover:bg-stone-50"
                    >
                        <span className="text-2xl">💱</span>

                        <div>
                            <p className="font-semibold text-stone-900">
                                Choose currencies
                            </p>

                            <p className="text-sm text-stone-500">
                                Set currencies for expenses
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={onStartPacking}
                        className="flex w-full items-center gap-4 rounded-2xl border border-stone-200 bg-white px-4 py-4 text-left transition hover:bg-stone-50"
                    >
                        <span className="text-2xl">🧳</span>

                        <div>
                            <p className="font-semibold text-stone-900">
                                Start packing
                            </p>

                            <p className="text-sm text-stone-500">
                                Create your packing checklist
                            </p>
                        </div>
                    </button>
                </div>

                <div className="border-t border-stone-200 p-4">
                    <button
                        onClick={onClose}
                        className="w-full rounded-xl bg-stone-100 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-200"
                    >
                        Not now
                    </button>
                </div>
            </div>
        </div>
    );
}