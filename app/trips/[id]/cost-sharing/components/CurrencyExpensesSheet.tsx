import type { Currency, Expense } from "../types";

type CurrencyExpensesSheetProps = {
    selectedCurrency: Currency;
    selectedCurrencyExpensesByDate: Record<string, Expense[]>;
    formatExpenseDate: (date: string) => string;
    formatAmount: (amount: number) => string;
    getMemberName: (memberId: number) => string;
    onClose: () => void;
};

export default function CurrencyExpensesSheet({
    selectedCurrency,
    selectedCurrencyExpensesByDate,
    formatExpenseDate,
    formatAmount,
    getMemberName,
    onClose,
}: CurrencyExpensesSheetProps) {
    return (
        <div
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 px-3 pt-16 pb-6 backdrop-blur-[2px] sm:items-center sm:p-6"
            onClick={onClose}
        >
            <div
                className="sheet-up flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="shrink-0 border-b border-stone-200 px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm text-stone-500">Expenses in</p>
                            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-stone-900">
                                {selectedCurrency}
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
                            aria-label="Close currency expenses"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="min-h-0 overflow-y-auto space-y-3 px-5 py-5">
                    {Object.entries(selectedCurrencyExpensesByDate).map(
                        ([dateKey, dayExpenses]) => (
                            <div key={dateKey} className="space-y-2">
                                <h3 className="px-1 text-sm font-semibold text-stone-900">
                                    {formatExpenseDate(dateKey)}
                                </h3>

                                {dayExpenses.map((expense) => (
                                    <div
                                        key={expense.id}
                                        className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-base font-semibold text-stone-900">
                                                    {expense.title}
                                                </p>

                                                <p className="mt-1 text-sm text-stone-500">
                                                    Paid by{" "}
                                                    {getMemberName(expense.paid_by_member_id)}
                                                </p>
                                            </div>

                                            <p className="shrink-0 text-sm font-semibold text-stone-900">
                                                {formatAmount(Number(expense.amount))}{" "}
                                                {expense.currency}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}