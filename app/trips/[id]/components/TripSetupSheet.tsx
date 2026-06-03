type TripSetupSheetProps = {
    inviteComplete: boolean;
    currenciesComplete: boolean;
    onClose: () => void;
    onInviteTravellers: () => void;
    onChooseCurrencies: () => void;
};

export default function TripSetupSheet({
    inviteComplete,
    currenciesComplete,
    onClose,
    onInviteTravellers,
    onChooseCurrencies,
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

                <div className="space-y-3 px-4 pb-4">
                    <SetupAction
                        complete={inviteComplete}
                        icon="📧"
                        title="Invite friends"
                        description={
                            inviteComplete
                                ? "Friends can always be invited later."
                                : "Send trip invitations by email."
                        }
                        onClick={onInviteTravellers}
                    />

                    <SetupAction
                        complete={currenciesComplete}
                        icon="💱"
                        title="Review currencies"
                        description={
                            currenciesComplete
                                ? "Currencies can be changed anytime."
                                : "Set up currencies for shared expenses."
                        }
                        onClick={onChooseCurrencies}
                    />

                    <p className="px-2 pt-1 text-center text-xs leading-5 text-stone-400">
                        You can skip any step and come back later.
                    </p>
                </div>

                <div className="border-t border-stone-200 p-4">
                    <button
                        onClick={onClose}
                        className="w-full rounded-xl bg-stone-100 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-200"
                    >
                        {inviteComplete && currenciesComplete
                            ? "Start exploring"
                            : inviteComplete || currenciesComplete
                                ? "Done for now"
                                : "Not now"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SetupAction({
    complete,
    icon,
    title,
    description,
    onClick,
}: {
    complete: boolean;
    icon: string;
    title: string;
    description: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-4 rounded-2xl border border-stone-200 bg-white px-4 py-4 text-left transition hover:bg-stone-50 active:scale-[0.99]"
        >
            <span
                className={
                    complete
                        ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
                        : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xl"
                }
            >
                {complete ? "✓" : icon}
            </span>

            <div className="min-w-0 flex-1">
                <p
                    className={
                        complete
                            ? "font-semibold text-stone-500 line-through"
                            : "font-semibold text-stone-900"
                    }
                >
                    {title}
                </p>

                <p className="mt-0.5 text-sm leading-5 text-stone-500">
                    {description}
                </p>
            </div>
        </button>
    );
}