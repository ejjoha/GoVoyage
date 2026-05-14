import type { Currency } from "../types";

type TotalCostItem = {
    currency: Currency;
    total: number;
};

type TotalCostSheetProps = {
    totalCostByCurrency: TotalCostItem[];
    formatAmount: (amount: number) => string;
    onClose: () => void;
    onSelectCurrency: (currency: Currency) => void;
};

export default function TotalCostSheet({
    totalCostByCurrency,
    formatAmount,
    onClose,
    onSelectCurrency,
}: TotalCostSheetProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pt-12 pb-6 backdrop-blur-[2px] sm:items-center sm:p-6"
            onClick={onClose}
        >
            <div
                className="sheet-up flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4">
                    <div>
                        <h2 className="text-xl font-semibold tracking-[-0.02em] text-stone-900">
                            Total cost
                        </h2>
                        <p className="mt-1 text-sm text-stone-500">
                            Tracked separately by currency.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
                        aria-label="Close total cost"
                    >
                        ✕
                    </button>
                </div>

                <div className="min-h-0 space-y-3 overflow-y-auto px-5 py-5">
                    {totalCostByCurrency.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center">
                            <p className="text-sm text-stone-500">
                                No expenses added yet.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
                                Total by currency
                            </div>

                            {totalCostByCurrency.map((item) => (
                                <button
                                    key={item.currency}
                                    type="button"
                                    onClick={() => onSelectCurrency(item.currency)}
                                    className="flex w-full items-center justify-between border-b border-stone-200 py-3 text-left transition hover:opacity-70 last:border-b-0"
                                >
                                    <span className="text-sm font-medium text-stone-600">
                                        {item.currency}
                                    </span>

                                    <span className="text-sm font-semibold text-stone-900">
                                        {formatAmount(item.total)}
                                    </span>
                                </button>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}