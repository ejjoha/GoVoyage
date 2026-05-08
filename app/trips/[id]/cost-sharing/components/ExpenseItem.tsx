import type { Expense } from "../types";
import { formatAmount } from "../formatters";

type ExpenseItemProps = {
  expense: Expense;
  isExpanded: boolean;
  participantNames: string[];
  sharePerPerson: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  getMemberName: (memberId: number) => string;
  getExpenseIcon: (title: string) => string;
};

export default function ExpenseItem({
  expense,
  isExpanded,
  participantNames,
  sharePerPerson,
  onToggle,
  onEdit,
  onDelete,
  getMemberName,
  getExpenseIcon,
}: ExpenseItemProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white/90 shadow-sm">
      <button type="button" onClick={onToggle} className="w-full px-4 py-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-lg">
              {getExpenseIcon(expense.title)}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-stone-900">
                {expense.title}
              </h3>

              <p className="mt-1 text-sm text-stone-500">
                Paid by {getMemberName(expense.paid_by_member_id)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end">
            <span className="text-base font-semibold text-stone-900">
              {formatAmount(Number(expense.amount))} {expense.currency}
            </span>

            <span
              className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-xs text-stone-500 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              ⌄
            </span>
          </div>
        </div>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-stone-200 bg-stone-50/70 px-4 py-4">
            <div className="space-y-2">
              <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 text-sm">
                <span className="text-stone-500">Paid by</span>
                <span className="break-words text-right font-medium text-stone-800">
                  {getMemberName(expense.paid_by_member_id)}
                </span>
              </div>

              <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 text-sm">
                <span className="text-stone-500">Shared between</span>
                <span className="break-words text-right font-medium text-stone-800">
                  {participantNames.join(", ")}
                </span>
              </div>

              <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 text-sm">
                <span className="text-stone-500">Each person pays</span>
                <span className="break-words text-right font-medium text-stone-800">
                  {formatAmount(sharePerPerson)} {expense.currency}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
              <button
                type="button"
                onClick={onDelete}
                aria-label="Delete expense"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-50 transition hover:bg-red-100 active:scale-95"
              >
                <img src="/icons/delete.svg" alt="" className="h-4 w-4 opacity-80" />
              </button>

              <button
                type="button"
                onClick={onEdit}
                aria-label="Edit expense"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white transition hover:bg-stone-100 active:scale-95"
              >
                <img src="/icons/edit.svg" alt="" className="h-4 w-4 opacity-70" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}