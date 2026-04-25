"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import ConfirmModal from "../components/ConfirmModal";

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

  const [showTotalCostSheet, setShowTotalCostSheet] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

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
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [expandedExpenseId, setExpandedExpenseId] = useState<number | null>(
    null
  );

  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    description: "",
    confirmLabel: "",
    cancelLabel: "",
    tone: "default",
    onConfirm: () => { },
  });

  const expenseFormBottomRef = useRef<HTMLDivElement | null>(null);

  const [showExpenses, setShowExpenses] = useState(false);

  function getMemberName(memberId: number) {
    return (
      tripMembers.find((member) => member.id === memberId)?.name || "Unknown"
    );
  }

  function openConfirm(config: any) {
    setConfirmState({
      open: true,
      ...config,
    });
  }

  function closeConfirm() {
    setConfirmState({
      open: false,
      title: "",
      description: "",
      confirmLabel: "",
      cancelLabel: "",
      tone: "default",
      onConfirm: () => { },
    });
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
    if (!paidByMemberId) return;

    const timeout = setTimeout(() => {
      expenseFormBottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 180); // 👈 syncs with preview appearing

    return () => clearTimeout(timeout);
  }, [paidByMemberId]);

  useEffect(() => {
    if (!Number.isFinite(id)) return;

    fetchTrip();
    fetchTripMembers();
    fetchExpenses();
  }, [id]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowTotalCostSheet(false);
        setShowExpenseForm(false);
        setEditingExpenseId(null);
        setExpandedExpenseId(null);
      }
    }

    if (showTotalCostSheet || showExpenseForm) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showTotalCostSheet, showExpenseForm]);

  function resetForm() {
    setTitle("");
    setAmount("");
    setCurrency("NOK");
    setDate(getTodayDateString());
    setPaidByMemberId(null);
    setSelectedParticipantIds(tripMembers.map((member) => member.id));
    setEditingExpenseId(null);
  }

  function closeExpenseForm() {
    resetForm();
    setShowExpenseForm(false);
  }

  function openNewExpenseForm() {
    resetForm();
    setShowExpenseForm(true);
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
    setExpandedExpenseId(null);
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
    setShowExpenseForm(true);
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
    setExpandedExpenseId(null);
    setShowExpenseForm(false);
    setShowExpenses(true);

    setTimeout(() => {
      setSuccessMessage("");
    }, 2000);
  }

  async function handleDeleteExpense(expenseId: number) {
    openConfirm({
      title: "Delete this expense?",
      description: "This will remove the expense permanently.",
      confirmLabel: "Delete expense",
      cancelLabel: "Keep expense",
      tone: "danger",
      onConfirm: async () => {
        const result = await deleteExpenseById(expenseId);

        if (!result.success) {
          alert(result.message);
          return;
        }

        closeConfirm();

        if (editingExpenseId === expenseId) {
          closeExpenseForm();
        }

        if (expandedExpenseId === expenseId) {
          setExpandedExpenseId(null);
        }

        await fetchExpenses();

        setDeleteSuccessMessage("Expense deleted");

        setTimeout(() => {
          setDeleteSuccessMessage("");
        }, 2000);
      },
    });
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

  const totalCostByCurrency = useMemo(() => {
    const totals: Partial<Record<Currency, number>> = {};

    for (const expense of expenses) {
      const currencyCode = expense.currency;
      const amountValue = Number(expense.amount) || 0;

      totals[currencyCode] = (totals[currencyCode] || 0) + amountValue;
    }

    return currencyOptions
      .map((currencyCode) => ({
        currency: currencyCode,
        total: totals[currencyCode] || 0,
      }))
      .filter((item) => item.total > 0);
  }, [expenses]);

  const travellerSummary = useMemo(() => {
    if (tripMembers.length === 0) return "No travellers yet";
    if (tripMembers.length === 1) {
      return `1 traveller on this trip: ${tripMembers[0].name}`;
    }
    return `${tripMembers.length} travellers on this trip: ${tripMembers
      .map((member) => member.name)
      .join(", ")}`;
  }, [tripMembers]);

  const heroStats = useMemo(() => {
    return [
      {
        label: "",
        value: "Total cost",
        onClick:
          totalCostByCurrency.length > 0
            ? () => setShowTotalCostSheet(true)
            : undefined,
        ariaLabel: "Show total cost",
      },
    ];
  }, [totalCostByCurrency.length]);

  if (isLoadingTrip) {
    return <div className="p-8">Loading trip...</div>;
  }

  if (!trip) {
    return <div className="p-8">Trip not found</div>;
  }

  return (
    <>
      <main className="mx-auto w-full min-h-screen max-w-2xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
        <TripHero
          title="Travel expenses"
          eyebrow={trip.destination}
          imageUrl={trip.image_url}
          backHref={`/trips/${id}`}
          stats={heroStats}
        />

        <div className="mt-6 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700 shadow-sm">
          {isLoadingMembers ? "Loading travellers..." : travellerSummary}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={openNewExpenseForm}
            disabled={tripMembers.length === 0}
            className="w-full rounded-2xl bg-rose-500 px-5 py-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(244,63,94,0.28)] transition-all duration-200 hover:bg-rose-600 hover:shadow-lg active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-lg leading-none">＋</span>
              Add expense
            </span>
          </button>
        </div>

        {(successMessage || deleteSuccessMessage) && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/10 px-6 pointer-events-none">
            <div className="toast-in pointer-events-auto w-full max-w-sm rounded-[2rem] border border-white/70 bg-white/90 px-6 py-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.20)] backdrop-blur-xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-2xl shadow-sm">
                ✓
              </div>

              <p className="text-lg font-semibold tracking-[-0.02em] text-stone-900">
                {successMessage || deleteSuccessMessage}
              </p>

              <p className="mt-1 text-sm text-stone-500">
                {deleteSuccessMessage
                  ? "The expense has been removed."
                  : "Expense saved successfully."}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="mb-2 border-b border-stone-200 pb-2">
            <button
              type="button"
              onClick={() => setShowExpenses((current) => !current)}
              className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-stone-100 active:scale-[0.99]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">💸</span>
                  <h2 className="text-xl font-semibold tracking-[-0.02em] text-stone-900">
                    Expenses
                  </h2>
                </div>

                <p className="mt-1 text-sm text-stone-500">
                  {showExpenses
                    ? "Hide the expense list"
                    : "Show all saved expenses"}
                </p>
              </div>

              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm text-stone-500 transition-all duration-200 ${showExpenses ? "rotate-180" : ""
                  }`}
              >
                ⌄
              </span>
            </button>
          </div>

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

                    const isExpanded = expandedExpenseId === expense.id;

                    return (
                      <div
                        key={expense.id}
                        className="rounded-2xl border border-stone-200 bg-white shadow-sm"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedExpenseId(isExpanded ? null : expense.id)
                          }
                          className="w-full px-4 py-4 text-left"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-base font-semibold text-stone-900">
                                {expense.title}
                              </h3>

                              <p className="mt-1 text-sm text-stone-500">
                                {formatAmount(Number(expense.amount))}{" "}
                                {expense.currency} ·{" "}
                                {formatExpenseDate(expense.expense_date)} · Paid
                                by {getMemberName(expense.paid_by_member_id)}
                              </p>
                            </div>

                            <span
                              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"
                                }`}
                            >
                              ⌄
                            </span>
                          </div>
                        </button>

                        <div
                          className={`grid transition-all duration-300 ease-in-out ${isExpanded
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
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
                                  <span className="text-stone-500">
                                    Shared between
                                  </span>
                                  <span className="break-words text-right font-medium text-stone-800">
                                    {participantNames.join(", ")}
                                  </span>
                                </div>

                                <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 text-sm">
                                  <span className="text-stone-500">
                                    Each person pays
                                  </span>
                                  <span className="break-words text-right font-medium text-stone-800">
                                    {formatAmount(sharePerPerson)}{" "}
                                    {expense.currency}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteExpense(expense.id)
                                  }
                                  aria-label="Delete expense"
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-50 transition hover:bg-red-100 active:scale-95"
                                >
                                  <img
                                    src="/icons/delete.svg"
                                    alt=""
                                    className="h-4 w-4 opacity-80"
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleEditExpense(expense)}
                                  aria-label="Edit expense"
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white transition hover:bg-stone-100 active:scale-95"
                                >
                                  <img
                                    src="/icons/edit.svg"
                                    alt=""
                                    className="h-4 w-4 opacity-70"
                                  />
                                </button>
                              </div>
                            </div>
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
            <div className="space-y-2">
              {currencyOptions.map((currencyCode) => {
                const items = groupedSummary[currencyCode];

                if (items.length === 0) return null;

                return (
                  <div
                    key={currencyCode}
                    className="rounded-xl border border-stone-200 bg-white/70 px-3 py-2"
                  >
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                      {currencyCode}
                    </div>

                    <div className="divide-y divide-stone-100">
                      {items.map((item, index) => (
                        <div
                          key={`${currencyCode}-${index}`}
                          className="flex items-center justify-between py-1 text-sm"
                        >
                          <div className="flex items-center gap-2 text-stone-700">
                            <span className="font-medium">{item.from}</span>
                            <span className="text-stone-400">owes</span>
                            <span className="font-medium">{item.to}</span>
                          </div>

                          <span className="font-semibold text-rose-500 tabular-nums">
                            {formatAmount(item.amount)}
                          </span>
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

      {showExpenseForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pb-3 pt-12 backdrop-blur-[2px] sm:items-center sm:p-6"
          onClick={closeExpenseForm}
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
                onClick={closeExpenseForm}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
                aria-label="Close expense form"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
              <form onSubmit={handleSaveExpense} className="space-y-4 pb-2">
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
                    <label className="text-sm font-medium text-stone-700">
                      Date
                    </label>
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

                  <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm font-semibold text-stone-900">
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

                    <p className="text-sm text-stone-600">
                      Each person pays:{" "}
                      <span className="font-semibold text-stone-900">
                        {formatAmount(currentPreview.sharePerPerson)}{" "}
                        {currentPreview.currency}
                      </span>
                    </p>

                    {!currentPreview.payerIncluded && (
                      <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        Note: the payer is not included in “Shared between”.
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
                    onClick={closeExpenseForm}
                    className="rounded-xl bg-stone-100 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={tripMembers.length === 0}
                    className="rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-stone-300"
                  >
                    {editingExpenseId ? "Update expense" : "Save expense"}
                  </button>
                </div>
                <div ref={expenseFormBottomRef} />
              </form>
            </div>
          </div>
        </div>
      )}

      {showTotalCostSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pt-12 pb-6 backdrop-blur-[2px] sm:items-center sm:p-6"
          onClick={() => setShowTotalCostSheet(false)}
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
                onClick={() => setShowTotalCostSheet(false)}
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
                    <div
                      key={item.currency}
                      className="flex items-center justify-between border-b border-stone-200 py-3 last:border-b-0"
                    >
                      <span className="text-sm font-medium text-stone-600">
                        {item.currency}
                      </span>

                      <span className="text-sm font-semibold text-stone-900">
                        {formatAmount(item.total)}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

      )}
      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        tone={confirmState.tone as "default" | "danger"}
        onCancel={closeConfirm}
        onConfirm={() => {
          if (confirmState.open) {
            confirmState.onConfirm();
          }
        }}
      />
    </>
  );
}