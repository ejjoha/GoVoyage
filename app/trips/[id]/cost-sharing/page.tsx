"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  fetchTripById,
  fetchTripMembersByTripId,
  fetchExpensesByTripId,
  createExpense,
  updateExpense,
  deleteExpenseById,
} from "./api";
import TripHero from "../components/TripHero";
import type { Trip } from "../types";
import type { Currency, Expense, TripMember } from "./types";
import {
  calculateExpensePreview,
  calculateGroupedSummary,
} from "./calculations";
import {
  formatAmount,
  formatExpenseDate,
  getTodayDateString,
} from "./formatters";

const currencyOptions: Currency[] = [
  "EUR",
  "GBP",
  "IDR",
  "NOK",
  "SDG",
  "THB",
  "USD",
];

export default function TripCostSharingPage() {
  const params = useParams();
  const id = Number(params.id);

  const [tripMembers, setTripMembers] = useState<TripMember[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("NOK");
  const [date, setDate] = useState(getTodayDateString());
  const [paidByMemberId, setPaidByMemberId] = useState<number | null>(null);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<number[]>(
    []
  );

  const [successMessage, setSuccessMessage] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);

  const [showExpenses, setShowExpenses] = useState(false);

  function getMemberName(memberId: number) {
    return (
      tripMembers.find((member) => member.id === memberId)?.name || "Unknown"
    );
  }

  async function fetchTrip() {
    setIsLoadingTrip(true);

    const data = await fetchTripById(id);
    setTrip(data);

    setIsLoadingTrip(false);
  }

  async function fetchTripMembers() {
    setIsLoadingMembers(true);

    const members = await fetchTripMembersByTripId(id);
    setTripMembers(members);

    setPaidByMemberId((current) => {
      if (current && members.some((member) => member.id === current)) {
        return current;
      }
      return null;
    });

    setSelectedParticipantIds((current) => {
      const validIds = current.filter((memberId) =>
        members.some((member) => member.id === memberId)
      );

      if (validIds.length > 0) return validIds;
      return members.map((member) => member.id);
    });

    setIsLoadingMembers(false);
  }

  async function fetchExpenses() {
    setIsLoadingExpenses(true);

    const data = await fetchExpensesByTripId(id);
    setExpenses(data);

    setIsLoadingExpenses(false);
  }

  useEffect(() => {
    if (!Number.isFinite(id)) return;

    fetchTrip();
    fetchTripMembers();
    fetchExpenses();
  }, [id]);

  function resetForm() {
    setTitle("");
    setAmount("");
    setCurrency("NOK");
    setDate(getTodayDateString());
    setPaidByMemberId(null);
    setSelectedParticipantIds(tripMembers.map((member) => member.id));
    setEditingExpenseId(null);
  }

  function toggleParticipant(memberId: number) {
    setSelectedParticipantIds((current) => {
      if (current.includes(memberId)) {
        return current.filter((id) => id !== memberId);
      }
      return [...current, memberId];
    });
  }

  function handleEditExpense(expense: Expense) {
    setEditingExpenseId(expense.id);
    setTitle(expense.title);
    setAmount(String(expense.amount));
    setCurrency(expense.currency);
    setDate(expense.expense_date);
    setPaidByMemberId(expense.paid_by_member_id);
    setSelectedParticipantIds(
      expense.participants.map((participant) => participant.member_id)
    );
    setShowExpenses(true);

    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function handleCancelEdit() {
    resetForm();
  }

  async function handleSaveExpense(e: React.FormEvent) {
    e.preventDefault();

    const parsedAmount = Number(amount);

    if (!title.trim()) {
      alert("Please fill in Expense title");
      return;
    }

    if (!parsedAmount || parsedAmount <= 0) {
      alert("Please fill in a valid Expense amount");
      return;
    }

    if (!date) {
      alert("Please choose a date");
      return;
    }

    if (!paidByMemberId) {
      alert("Please choose who paid");
      return;
    }

    if (selectedParticipantIds.length === 0) {
      alert("Please choose at least one person in Shared between");
      return;
    }

    const participantIds = [...new Set(selectedParticipantIds)];

    const result = editingExpenseId
      ? await updateExpense({
        expenseId: editingExpenseId,
        tripId: id,
        title: title.trim(),
        amount: parsedAmount,
        currency,
        expenseDate: date,
        paidByMemberId,
        participantIds,
      })
      : await createExpense({
        tripId: id,
        title: title.trim(),
        amount: parsedAmount,
        currency,
        expenseDate: date,
        paidByMemberId,
        participantIds,
      });

    if (!result.success) {
      alert(result.message);
      return;
    }

    setSuccessMessage(editingExpenseId ? "Expense updated" : "Expense added");

    await fetchExpenses();
    resetForm();
    setShowExpenses(true);

    setTimeout(() => {
      setSuccessMessage("");
    }, 2000);
  }

  async function handleDeleteExpense(expenseId: number) {
    const shouldDelete = confirm("Delete this expense?");
    if (!shouldDelete) return;

    const result = await deleteExpenseById(expenseId);

    if (!result.success) {
      alert(result.message);
      return;
    }

    if (editingExpenseId === expenseId) {
      resetForm();
    }

    await fetchExpenses();
  }

  const currentPreview = useMemo(() => {
    return calculateExpensePreview({
      amount,
      currency,
      paidByMemberId,
      selectedParticipantIds,
      getMemberName,
    });
  }, [amount, currency, paidByMemberId, selectedParticipantIds, tripMembers]);

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      if (a.expense_date === b.expense_date) return b.id - a.id;
      return b.expense_date.localeCompare(a.expense_date);
    });
  }, [expenses]);

  const groupedSummary = useMemo(() => {
    return calculateGroupedSummary({
      expenses,
      currencies: currencyOptions,
      getMemberName,
    });
  }, [expenses, tripMembers]);

  const travellerSummary = useMemo(() => {
    if (tripMembers.length === 0) return "No travellers yet";
    if (tripMembers.length === 1) {
      return `1 traveller on this trip: ${tripMembers[0].name}`;
    }
    return `${tripMembers.length} travellers on this trip: ${tripMembers
      .map((member) => member.name)
      .join(", ")}`;
  }, [tripMembers]);

  if (isLoadingTrip) {
    return <div className="p-8">Loading trip...</div>;
  }

  if (!trip) {
    return <div className="p-8">Trip not found</div>;
  }

  return (
    <main className="mx-auto w-full min-h-screen max-w-2xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <TripHero
        title="Trip cost sharing"
        subtitle="Travel expenses"
        eyebrow={trip.destination}
        imageUrl={trip.image_url}
        backHref={`/trips/${id}`}
      />

      <div className="mt-6 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700 shadow-sm">
        {isLoadingMembers ? "Loading travellers..." : travellerSummary}
      </div>

      <form
        onSubmit={handleSaveExpense}
        className="mt-6 space-y-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">
              {editingExpenseId ? "Edit expense" : "Add expense"}
            </h2>
          </div>

          {editingExpenseId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="shrink-0 text-sm text-stone-500 underline"
            >
              Cancel
            </button>
          )}
        </div>

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
            <label className="text-sm font-medium text-stone-700">
              Paid by
            </label>
            <select
              value={paidByMemberId ?? ""}
              onChange={(e) =>
                setPaidByMemberId(
                  e.target.value ? Number(e.target.value) : null
                )
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

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-stone-700">
                Shared between
              </label>

              {tripMembers.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedParticipantIds(
                      tripMembers.map((member) => member.id)
                    )
                  }
                  className="text-sm font-medium text-stone-500 underline"
                >
                  Select all
                </button>
              )}
            </div>

            <div className="space-y-2">
              {tripMembers.map((member) => {
                const checked = selectedParticipantIds.includes(member.id);

                return (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm text-stone-800"
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

        <button
          type="submit"
          disabled={tripMembers.length === 0}
          className="w-full rounded-2xl px-5 py-3.5 text-sm font-medium text-white shadow-md transition-all duration-200 active:scale-[0.97] bg-rose-500 hover:bg-rose-600 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
        >
          <span className="flex items-center justify-center gap-2">
            <span className="text-lg">✓</span>
            {editingExpenseId ? "Update expense" : "Add expense"}
          </span>
        </button>
      </form>

      {successMessage && (
        <div className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {successMessage}
        </div>
      )}

      {currentPreview && (
        <div className="mt-6 space-y-3 rounded-3xl bg-rose-50 p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-rose-800">
            Current preview
          </h2>

          <p className="text-sm text-rose-700">
            Each person pays: {formatAmount(currentPreview.sharePerPerson)}{" "}
            {currentPreview.currency}
          </p>

          {!currentPreview.payerIncluded && (
            <p className="text-sm text-amber-700">
              Note: the payer is not included in “Shared between”.
            </p>
          )}

          {currentPreview.oweLines.length === 0 ? (
            <p className="text-sm text-blue-700">No one owes anything yet.</p>
          ) : (
            <div className="space-y-2">
              {currentPreview.oweLines.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-white px-3 py-3 text-sm text-stone-700"
                >
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">
                    <span className="font-semibold text-stone-900">{item.from}</span>
                    {" → "}
                    <span className="font-semibold text-stone-900">{item.to}</span>
                  </span>

                  <span className="font-semibold text-blue-700">
                    {formatAmount(item.amount)} {item.currency}
                  </span>
                </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <button
          type="button"
          onClick={() => setShowExpenses((current) => !current)}
          className="flex w-full items-center justify-between rounded-3xl border border-stone-200 bg-white px-4 py-4 text-left shadow-sm transition hover:bg-stone-50"
        >
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Expenses</h2>
            <p className="mt-1 text-sm text-stone-500">
              {showExpenses
                ? "Hide the expense list"
                : "Show all saved expenses"}
            </p>
          </div>

          <span
            className={`text-xl text-stone-400 transition-transform ${showExpenses ? "rotate-180" : "rotate-0"
              }`}
          >
            ⌄
          </span>
        </button>

        {showExpenses && (
          <div className="mt-4">
            {isLoadingExpenses ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-500 shadow-sm">
                Loading expenses...
              </div>
            ) : sortedExpenses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center">
                <p className="text-sm text-stone-500">No expenses added yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedExpenses.map((expense) => {
                  const participantNames = expense.participants.map(
                    (participant) => getMemberName(participant.member_id)
                  );

                  const sharePerPerson =
                    expense.participants.length > 0
                      ? Number(expense.amount) / expense.participants.length
                      : 0;

                  return (
                    <div
                      key={expense.id}
                      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-stone-900">
                            {expense.title}
                          </h3>
                          <p className="mt-1 text-sm text-stone-500">
                            {formatAmount(Number(expense.amount))}{" "}
                            {expense.currency} ·{" "}
                            {formatExpenseDate(expense.expense_date)}
                          </p>
                          <p className="mt-2 text-sm text-stone-500">
                            Paid by: {getMemberName(expense.paid_by_member_id)}
                          </p>
                          <p className="mt-1 text-sm text-stone-500">
                            Shared between: {participantNames.join(", ")}
                          </p>
                          <p className="mt-3 text-sm font-medium text-stone-700">
                            Each person pays: {formatAmount(sharePerPerson)}{" "}
                            {expense.currency}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditExpense(expense)}
                            className="rounded-full bg-amber-50 px-3 py-2 text-sm font-medium text-amber-600 transition hover:bg-amber-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="rounded-full bg-red-50 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">
            Summary by currency
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            No conversion. Each currency is tracked separately.
          </p>
        </div>

        {expenses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center">
            <p className="text-sm text-stone-500">
              Add expenses to see the summary.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currencyOptions.map((currencyCode) => {
              const items = groupedSummary[currencyCode];

              if (items.length === 0) return null;

              return (
                <div
                  key={currencyCode}
                  className="rounded-2xl border border-stone-200 bg-stone-50 p-4 shadow-sm"
                >
                  <div className="mb-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600 shadow-sm">
                    {currencyCode}
                  </div>

                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div
                        key={`${currencyCode}-${index}`}
                        className="rounded-xl bg-white px-3 py-3 text-sm text-stone-700 border border-stone-100"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-stone-600">
                            <span className="font-semibold text-stone-900">{item.from}</span>
                            {" → "}
                            <span className="font-semibold text-stone-900">{item.to}</span>
                          </span>

                          <span className="font-semibold text-rose-700">
                            {formatAmount(item.amount)} {item.currency}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}