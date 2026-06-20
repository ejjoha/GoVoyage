import type { Currency, TripMember } from "../types";
import { formatAmount } from "../formatters";

type ExpensePreview = {
    sharePerPerson: number;
    currency: Currency;
    payerIncluded: boolean;
    oweLines: {
        from: string;
        to: string;
        amount: number;
        currency: Currency;
    }[];
};

type ExpenseFormProps = {
    editingExpenseId: number | null;
    isSavingExpense: boolean;
    title: string;
    setTitle: (value: string) => void;
    amount: string;
    setAmount: (value: string) => void;
    currency: Currency;
    setCurrency: (value: Currency) => void;
    date: string;
    setDate: (value: string) => void;
    paidByMemberId: number | null;
    setPaidByMemberId: (value: number | null) => void;
    selectedParticipantIds: number[];
    toggleParticipant: (memberId: number) => void;
    setSelectedParticipantIds: (ids: number[]) => void;
    tripMembers: TripMember[];
    currencyOptions: Currency[];
    currentPreview: ExpensePreview | null;
    onSubmit: (event: React.FormEvent) => void;
    onCancel: () => void;
    expenseFormBottomRef: React.RefObject<HTMLDivElement | null>;
};

export default function ExpenseForm({
    editingExpenseId,
    isSavingExpense,
    title,
    setTitle,
    amount,
    setAmount,
    currency,
    setCurrency,
    date,
    setDate,
    paidByMemberId,
    setPaidByMemberId,
    selectedParticipantIds,
    toggleParticipant,
    setSelectedParticipantIds,
    tripMembers,
    currencyOptions,
    currentPreview,
    onSubmit,
    onCancel,
    expenseFormBottomRef,
}: ExpenseFormProps) {
    const isPaidOnBehalf =
        selectedParticipantIds.length > 0 &&
        paidByMemberId !== null &&
        !selectedParticipantIds.includes(paidByMemberId);

    const isSinglePersonPaidOnBehalf =
        isPaidOnBehalf && selectedParticipantIds.length === 1;

    return (
        <form onSubmit={onSubmit} className="space-y-4 pb-2">
            <div className="space-y-3">
                <input
                    type="text"
                    placeholder="Expense title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                    disabled={tripMembers.length === 0}
                />

                <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Expense amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
                    disabled={tripMembers.length === 0}
                />

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-stone-700">
                        Expense currency
                    </label>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as Currency)}
                        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                        disabled={tripMembers.length === 0}
                    >
                        {currencyOptions.map((currencyCode) => (
                            <option key={currencyCode} value={currencyCode}>
                                {currencyCode}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-stone-700">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                        disabled={tripMembers.length === 0}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-stone-700">Paid by</label>
                    <select
                        value={paidByMemberId ?? ""}
                        onChange={(e) =>
                            setPaidByMemberId(e.target.value ? Number(e.target.value) : null)
                        }
                        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800"
                        disabled={tripMembers.length === 0}
                    >
                        <option value="">Choose traveller</option>
                        {tripMembers.map((member) => (
                            <option key={member.id} value={member.id}>
                                {member.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <label className="text-sm font-semibold text-stone-900">
                            {isPaidOnBehalf ? "Cost belongs to" : "Shared between"}
                        </label>

                        {tripMembers.length > 0 && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedParticipantIds(tripMembers.map((member) => member.id))
                                }
                                className="text-sm font-medium text-stone-500 underline"
                            >
                                Select all
                            </button>
                        )}
                    </div>

                    <div className="mt-3 space-y-2">
                        {tripMembers.map((member) => {
                            const checked = selectedParticipantIds.includes(member.id);

                            return (
                                <label
                                    key={member.id}
                                    className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800"
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleParticipant(member.id)}
                                        disabled={tripMembers.length === 0}
                                    />
                                    <span>{member.name}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>

            {currentPreview && (
                <div className="space-y-3 rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm">
                    <h3 className="text-base font-semibold text-stone-900">
                        Expense summary
                    </h3>

                    {!isSinglePersonPaidOnBehalf && (
                        <p className="text-sm text-stone-600">
                            Each person pays:{" "}
                            <span className="font-semibold text-stone-900">
                                {formatAmount(currentPreview.sharePerPerson)}{" "}
                                {currentPreview.currency}
                            </span>
                        </p>
                    )}

                    {!currentPreview.payerIncluded && (
                        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
                            This expense was paid on behalf of another traveller.
                        </p>
                    )}

                    {currentPreview.oweLines.length === 0 ? (
                        <p className="rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-800">
                            No one owes anything yet.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {currentPreview.oweLines.map((item, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl bg-stone-50 px-3 py-3 text-sm text-stone-700"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-stone-600">
                                            <span className="font-semibold text-stone-900">
                                                {item.from}
                                            </span>
                                            {" owes "}
                                            <span className="font-semibold text-stone-900">
                                                {item.to}
                                            </span>
                                        </span>

                                        <span className="shrink-0 font-semibold text-stone-900">
                                            {formatAmount(item.amount)} {item.currency}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-stone-200 pt-4 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-xl bg-stone-100 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-200"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={isSavingExpense}
                    className="rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                    {isSavingExpense
                        ? editingExpenseId
                            ? "Updating..."
                            : "Saving..."
                        : editingExpenseId
                            ? "Save changes"
                            : "Add expense"}
                </button>
            </div>

            <div ref={expenseFormBottomRef} />
        </form>
    );
}