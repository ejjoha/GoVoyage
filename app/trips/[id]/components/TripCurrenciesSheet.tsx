import { useState } from "react";

type TripCurrenciesSheetProps = {
    editCurrencies: string[];
    setEditCurrencies: (currencies: string[]) => void;
    onClose: () => void;
    onSave: () => void;
};

const AVAILABLE_CURRENCIES = [
    "NOK",
    "EUR",
    "USD",
    "GBP",
    "SEK",
    "DKK",
    "CHF",
    "JPY",
    "AUD",
    "CAD",
];

export default function TripCurrenciesSheet({
    editCurrencies,
    setEditCurrencies,
    onClose,
    onSave,
}: TripCurrenciesSheetProps) {
    const [customCurrency, setCustomCurrency] = useState("");

    const currenciesToShow = Array.from(
        new Set([...AVAILABLE_CURRENCIES, ...editCurrencies])
    );

    function toggleCurrency(currency: string) {
        if (editCurrencies.includes(currency)) {
            setEditCurrencies(
                editCurrencies.filter((value) => value !== currency)
            );
            return;
        }

        setEditCurrencies([...editCurrencies, currency]);
    }

    function addCustomCurrency() {
        const currency = customCurrency.trim().toUpperCase();

        if (!currency) return;

        if (!editCurrencies.includes(currency)) {
            setEditCurrencies([...editCurrencies, currency]);
        }

        setCustomCurrency("");
    }

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
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-stone-400">
                            Trip setup
                        </p>

                        <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-stone-900">
                            Review currencies
                        </h2>

                        <p className="mt-1 text-sm text-stone-500">
                            Choose the currencies you expect to use on this trip.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
                        aria-label="Close currencies"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-3 overflow-y-auto px-5 py-5">
                    {currenciesToShow.map((currency) => {
                        const selected = editCurrencies.includes(currency);

                        return (
                            <button
                                key={currency}
                                type="button"
                                onClick={() => toggleCurrency(currency)}
                                className={
                                    selected
                                        ? "flex w-full items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4"
                                        : "flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-4"
                                }
                            >
                                <span className="font-medium text-stone-900">
                                    {currency}
                                </span>

                                <span
                                    className={
                                        selected
                                            ? "text-emerald-600 font-semibold"
                                            : "text-stone-300"
                                    }
                                >
                                    {selected ? "✓" : "○"}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="border-t border-stone-200 px-5 py-4">
                    <p className="mb-2 text-sm font-medium text-stone-700">
                        Add another currency
                    </p>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={customCurrency}
                            onChange={(e) => setCustomCurrency(e.target.value)}
                            placeholder="e.g. THB"
                            maxLength={3}
                            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm uppercase text-stone-800 placeholder:normal-case placeholder:text-stone-400"
                        />

                        <button
                            type="button"
                            onClick={addCustomCurrency}
                            className="rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
                        >
                            Add
                        </button>
                    </div>

                    <p className="mt-2 text-xs text-stone-400">
                        Use the three-letter currency code, like THB, MXN, or ISK.
                    </p>
                </div>

                <div className="border-t border-stone-200 p-4">
                    <button
                        type="button"
                        onClick={onSave}
                        className="w-full rounded-2xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}