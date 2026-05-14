import type { RefObject } from "react";
import ExpenseForm from "./ExpenseForm";
import type { Currency, TripMember } from "../types";

type ExpenseFormModalProps = {
    editingExpenseId: number | null;
    expenseFormError: string;
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
    setSelectedParticipantIds: React.Dispatch<React.SetStateAction<number[]>>;

    tripMembers: TripMember[];
    currencyOptions: Currency[];
    currentPreview: ReturnType<typeof import("../calculations").calculateExpensePreview>;

    onSubmit: (event: React.FormEvent) => void;
    onCancel: () => void;

    expenseFormBottomRef: RefObject<HTMLDivElement | null>;
};

export default function ExpenseFormModal({
    editingExpenseId,
    expenseFormError,
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
}: ExpenseFormModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pb-3 pt-12 backdrop-blur-[2px] sm:items-center sm:p-6"
            onClick={onCancel}
        >
            <div
                className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-xl font-semibold tracking-[-0.02em] text-stone-900">
                            {editingExpenseId ? "Edit expense" : "Add expense"}
                        </h2>
                        <p className="mt-1 text-sm text-stone-500">
                            Add the details and keep the shared costs up to date.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
                        aria-label="Close expense form"
                    >
                        ✕
                    </button>
                </div>

                <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
                    {expenseFormError && (
                        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {expenseFormError}
                        </div>
                    )}

                    <ExpenseForm
                        editingExpenseId={editingExpenseId}
                        isSavingExpense={isSavingExpense}
                        title={title}
                        setTitle={setTitle}
                        amount={amount}
                        setAmount={setAmount}
                        currency={currency}
                        setCurrency={setCurrency}
                        date={date}
                        setDate={setDate}
                        paidByMemberId={paidByMemberId}
                        setPaidByMemberId={setPaidByMemberId}
                        selectedParticipantIds={selectedParticipantIds}
                        toggleParticipant={toggleParticipant}
                        setSelectedParticipantIds={setSelectedParticipantIds}
                        tripMembers={tripMembers}
                        currencyOptions={currencyOptions}
                        currentPreview={currentPreview}
                        onSubmit={onSubmit}
                        onCancel={onCancel}
                        expenseFormBottomRef={expenseFormBottomRef}
                    />
                </div>
            </div>
        </div>
    );
}