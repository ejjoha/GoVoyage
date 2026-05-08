import ExpenseItem from "./ExpenseItem";
import type { Expense } from "../types";
import { formatExpenseDate } from "../formatters";

type ExpenseListProps = {
    groupedExpensesByDate: Record<string, Expense[]>;
    expandedExpenseId: number | null;
    setExpandedExpenseId: (id: number | null) => void;
    getMemberName: (memberId: number) => string;
    getExpenseIcon: (title: string) => string;
    handleEditExpense: (expense: Expense) => void;
    handleDeleteExpense: (expenseId: number) => void;
};

export default function ExpenseList({
    groupedExpensesByDate,
    expandedExpenseId,
    setExpandedExpenseId,
    getMemberName,
    getExpenseIcon,
    handleEditExpense,
    handleDeleteExpense,
}: ExpenseListProps) {
    return (
        <div className="space-y-3">
            {Object.entries(groupedExpensesByDate).map(([dateKey, dayExpenses]) => (
                <div key={dateKey} className="space-y-1">
                    <h3 className="px-1 pt-3 pb-1 text-sm font-semibold text-stone-900">
                        {formatExpenseDate(dateKey)}
                    </h3>

                    {dayExpenses.map((expense) => {
                        const participantNames = expense.participants.map((participant) =>
                            getMemberName(participant.member_id)
                        );

                        const sharePerPerson =
                            expense.participants.length > 0
                                ? Number(expense.amount) / expense.participants.length
                                : 0;

                        const isExpanded = expandedExpenseId === expense.id;

                        return (
                            <ExpenseItem
                                key={expense.id}
                                expense={expense}
                                isExpanded={isExpanded}
                                participantNames={participantNames}
                                sharePerPerson={sharePerPerson}
                                onToggle={() =>
                                    setExpandedExpenseId(isExpanded ? null : expense.id)
                                }
                                onEdit={() => handleEditExpense(expense)}
                                onDelete={() => handleDeleteExpense(expense.id)}
                                getMemberName={getMemberName}
                                getExpenseIcon={getExpenseIcon}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
}