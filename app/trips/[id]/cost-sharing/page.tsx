"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
import ExpenseItem from "./components/ExpenseItem";
import ExpenseList from "./components/ExpenseList";
import ExpenseFormModal from "./components/ExpenseFormModal";
import TotalCostSheet from "./components/TotalCostSheet";
import CurrencyExpensesSheet from "./components/CurrencyExpensesSheet";

const currencyOptions: Currency[] = [
  "NOK",
  "EUR",
  "USD",
  "GBP",
  "THB",
  "IDR",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
  "SEK",
  "DKK",
  "PLN",
  "CZK",
  "HUF",
  "ISK",
  "SGD",
  "MYR",
  "PHP",
  "VND",
  "KHR",
  "LAK",
  "INR",
  "CNY",
  "HKD",
  "KRW",
  "TWD",
  "NZD",
  "MXN",
  "BRL",
  "ARS",
  "CLP",
  "COP",
  "PEN",
  "ZAR",
  "MAD",
  "EGP",
  "TRY",
  "AED",
  "QAR",
  "SAR",
  "ILS",
  "SDG",
];


export default function TripCostSharingPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [showTotalCostSheet, setShowTotalCostSheet] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const [tripMembers, setTripMembers] = useState<TripMember[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const tripCurrencyOptions = useMemo(() => {
    if (trip?.currencies && trip.currencies.length > 0) {
      return trip.currencies;
    }

    return ["NOK", "EUR", "USD"];
  }, [trip]);

  const [isLoadingTrip, setIsLoadingTrip] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

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
  const [expenseFormError, setExpenseFormError] = useState("");
  const [isSavingExpense, setIsSavingExpense] = useState(false);
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
  const [showScrollTop, setShowScrollTop] = useState(false);

  function getMemberName(memberId: number) {
    return (
      tripMembers.find((member) => member.id === memberId)?.name || "Unknown"
    );
  }
  function getExpenseIcon(title: string) {
    const t = title.toLowerCase();

    if (
      t.includes("food") ||
      t.includes("restaurant") ||
      t.includes("dinner") ||
      t.includes("lunch") ||
      t.includes("breakfast") ||
      t.includes("brunch") ||
      t.includes("sushi") ||
      t.includes("pizza") ||
      t.includes("burger") ||
      t.includes("middag") ||
      t.includes("lunsj") ||
      t.includes("frokost")
    )
      return "🍽️";

    if (
      t.includes("coffee") ||
      t.includes("cafe") ||
      t.includes("espresso") ||
      t.includes("latte") ||
      t.includes("kaffe")
    )
      return "☕";

    if (
      t.includes("beer") ||
      t.includes("wine") ||
      t.includes("bar") ||
      t.includes("cocktail") ||
      t.includes("drinks") ||
      t.includes("pub") ||
      t.includes("øl") ||
      t.includes("vin")
    )
      return "🍷";

    if (
      t.includes("taxi") ||
      t.includes("uber") ||
      t.includes("bolt") ||
      t.includes("cab")
    )
      return "🚕";

    if (
      t.includes("train") ||
      t.includes("rail") ||
      t.includes("metro") ||
      t.includes("subway") ||
      t.includes("tram") ||
      t.includes("tog")
    )
      return "🚆";

    if (
      t.includes("bus") ||
      t.includes("coach")
    )
      return "🚌";

    if (
      t.includes("boat") ||
      t.includes("ferry") ||
      t.includes("ship") ||
      t.includes("båt")
    )
      return "⛴️";

    if (
      t.includes("flight") ||
      t.includes("plane") ||
      t.includes("airport") ||
      t.includes("airfare")
    )
      return "✈️";

    if (
      t.includes("hotel") ||
      t.includes("stay") ||
      t.includes("hostel") ||
      t.includes("resort") ||
      t.includes("airbnb") ||
      t.includes("accommodation")
    )
      return "🏨";

    if (
      t.includes("shopping") ||
      t.includes("mall") ||
      t.includes("souvenir") ||
      t.includes("store")
    )
      return "🛍️";

    if (
      t.includes("museum") ||
      t.includes("gallery") ||
      t.includes("ticket") ||
      t.includes("tour") ||
      t.includes("activity") ||
      t.includes("concert")
    )
      return "🎟️";

    if (
      t.includes("beach") ||
      t.includes("island") ||
      t.includes("pool")
    )
      return "🏝️";

    if (
      t.includes("fuel") ||
      t.includes("gas") ||
      t.includes("petrol") ||
      t.includes("diesel")
    )
      return "⛽";

    if (
      t.includes("pharmacy") ||
      t.includes("medicine") ||
      t.includes("hospital")
    )
      return "💊";
    if (
      t.includes("van") ||
      t.includes("minivan") ||
      t.includes("mini van") ||
      t.includes("shuttle")
    )
      return "🚐";

    if (
      t.includes("tuktuk") ||
      t.includes("tuk tuk") ||
      t.includes("rickshaw")
    )
      return "🛺";

    if (
      t.includes("scooter") ||
      t.includes("vespa") ||
      t.includes("moped")
    )
      return "🛵";

    if (
      t.includes("bike") ||
      t.includes("bicycle") ||
      t.includes("cycling")
    )
      return "🚲";

    if (
      t.includes("car rental") ||
      t.includes("rental car") ||
      t.includes("rental")
    )
      return "🚗";

    if (
      t.includes("parking") ||
      t.includes("toll")
    )
      return "🅿️";

    if (
      t.includes("spa") ||
      t.includes("massage") ||
      t.includes("sauna")
    )
      return "💆";

    if (
      t.includes("hiking") ||
      t.includes("trek") ||
      t.includes("mountain")
    )
      return "🥾";

    if (
      t.includes("diving") ||
      t.includes("snorkeling") ||
      t.includes("snorkelling")
    )
      return "🤿";

    if (
      t.includes("surf") ||
      t.includes("surfing")
    )
      return "🏄";

    if (
      t.includes("gym") ||
      t.includes("workout") ||
      t.includes("fitness")
    )
      return "🏋️";

    if (
      t.includes("laundry") ||
      t.includes("washing")
    )
      return "🧺";

    if (
      t.includes("sim") ||
      t.includes("esim") ||
      t.includes("data")
    )
      return "📱";

    if (
      t.includes("visa") ||
      t.includes("immigration")
    )
      return "🛂";

    if (
      t.includes("tip") ||
      t.includes("tips") ||
      t.includes("gratuity")
    )
      return "💰";

    if (
      t.includes("market") ||
      t.includes("bazaar")
    )
      return "🏬";

    if (
      t.includes("temple") ||
      t.includes("church") ||
      t.includes("mosque")
    )
      return "🕌";

    if (
      t.includes("camping") ||
      t.includes("camp")
    )
      return "🏕️";

    return "💸";
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
    async function checkAuthAndLoad() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      fetchTrip();
      fetchTripMembers();
      fetchExpenses();
    }

    checkAuthAndLoad();
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

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 500);
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function resetForm() {
    setTitle("");
    setAmount("");
    setCurrency("NOK");
    setDate(getTodayDateString());
    setPaidByMemberId(null);
    setSelectedParticipantIds(tripMembers.map((member) => member.id));
    setEditingExpenseId(null);
    setExpenseFormError("");
  }

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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

    setExpenseFormError("");

    const parsedAmount = Number(amount);

    if (!title.trim()) {
      setExpenseFormError("Please fill in an expense title.");
      return;
    }

    if (!parsedAmount || parsedAmount <= 0) {
      setExpenseFormError("Please enter a valid expense amount.");
      return;
    }

    if (!date) {
      setExpenseFormError("Please choose a date.");
      return;
    }

    if (!paidByMemberId) {
      setExpenseFormError("Please choose who paid.");
      return;
    }

    if (selectedParticipantIds.length === 0) {
      setExpenseFormError("Please choose at least one participant.");
      return;
    }

    const participantIds = [...new Set(selectedParticipantIds)];

    setIsSavingExpense(true);

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
      setExpenseFormError(result.message);
      setIsSavingExpense(false);
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
    setIsSavingExpense(false);
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
          setExpenseFormError(result.message);
          setIsSavingExpense(false);
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

        setDeleteSuccessMessage("Expense removed");

        setTimeout(() => {
          setDeleteSuccessMessage("");
        }, 2000);
        setIsSavingExpense(false);
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

  const groupedExpensesByDate = useMemo(() => {
    return sortedExpenses.reduce((groups, expense) => {
      const dateKey = expense.expense_date;

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(expense);
      return groups;
    }, {} as Record<string, Expense[]>);
  }, [sortedExpenses]);

  const groupedSummary = useMemo(() => {
    return calculateGroupedSummary({
      expenses,
      currencies: currencyOptions,
      getMemberName,
    });
  }, [expenses, tripMembers]);

  function getCurrencyDotColor(currency: Currency) {
    switch (currency) {
      case "NOK":
        return "bg-blue-400";
      case "THB":
        return "bg-amber-400";
      case "USD":
        return "bg-emerald-400";
      case "EUR":
        return "bg-violet-400";
      case "GBP":
        return "bg-rose-400";
      case "IDR":
        return "bg-orange-400";
      case "SDG":
        return "bg-teal-400";
      default:
        return "bg-stone-300";
    }
  }

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

  const selectedCurrencyExpenses = selectedCurrency
    ? [...expenses]
      .filter(
        (expense) => expense.currency === selectedCurrency
      )
      .sort(
        (a, b) =>
          new Date(b.expense_date).getTime() -
          new Date(a.expense_date).getTime()
      )
    : [];

  const selectedCurrencyExpensesByDate = selectedCurrencyExpenses.reduce(
    (groups, expense) => {
      const dateKey = expense.expense_date;

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(expense);
      return groups;
    },
    {} as Record<string, Expense[]>
  );

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

        <div className="mt-8 overflow-hidden rounded-[2rem] border border-stone-200 bg-white/85 shadow-sm">
          <button
            type="button"
            onClick={() => setShowExpenses((current) => !current)}
            className="group flex w-full items-center justify-between px-4 py-4 text-left transition hover:bg-stone-50 active:scale-[0.99]"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-lg">
                  💸
                </span>

                <div>
                  <h2 className="text-xl font-semibold tracking-[-0.02em] text-stone-900">
                    Expenses
                  </h2>

                  <p className="mt-0.5 text-sm text-stone-500">
                    {showExpenses
                      ? "Hide the expense list"
                      : "Show all saved expenses"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden text-xs font-semibold text-stone-400 sm:inline">
                {showExpenses ? "Collapse" : "Expand"}
              </span>

              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-white shadow-[0_10px_24px_rgba(244,63,94,0.32)] transition-transform duration-300 ${showExpenses ? "rotate-180" : "rotate-0"
                  }`}
              >
                <img
                  src="/icons/chevron-down.svg"
                  alt=""
                  className="h-5 w-5 brightness-0 invert"
                />
              </span>
            </div>
          </button>

          {showExpenses && (
            <div className="border-t border-stone-200 px-4 pb-4">
              {isLoadingExpenses ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-500 shadow-sm">
                  Loading expenses...
                </div>
              ) : sortedExpenses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center">
                  <p className="text-sm text-stone-500">No expenses added yet.</p>
                </div>
              ) : (

                <ExpenseList
                  groupedExpensesByDate={groupedExpensesByDate}
                  expandedExpenseId={expandedExpenseId}
                  setExpandedExpenseId={setExpandedExpenseId}
                  getMemberName={getMemberName}
                  getExpenseIcon={getExpenseIcon}
                  handleEditExpense={handleEditExpense}
                  handleDeleteExpense={handleDeleteExpense}
                />
              )}
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-stone-900">
                  Who owes who
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Balances are grouped by currency.
                </p>
              </div>

              <div className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-stone-500 shadow-sm">
                Summary
              </div>
            </div>
          </div>

          {expenses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center">
              <p className="text-sm text-stone-500">
                Add expenses to see the summary.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {currencyOptions.map((currencyCode) => {
                const items = groupedSummary[currencyCode];

                if (items.length === 0) return null;

                return (
                  <div
                    key={currencyCode}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${getCurrencyDotColor(currencyCode)}`}
                      />

                      <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                        {currencyCode}
                      </span>
                    </div>

                    <div className="divide-y divide-stone-100">
                      {items.map((item, index) => (
                        <button
                          key={`${currencyCode}-${index}`}
                          type="button"
                          onClick={() => setSelectedCurrency(currencyCode)}
                          className="flex w-full items-center justify-between gap-3 py-2 text-left text-sm transition hover:opacity-70"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium text-stone-800">
                              {item.from}
                            </p>
                            <p className="mt-0.5 text-xs text-stone-500">
                              owes {item.to}
                            </p>
                          </div>

                          <span className="font-semibold text-stone-900 tabular-nums">
                            {formatAmount(item.amount)} {currencyCode}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main >

      {showExpenseForm && (
        <ExpenseFormModal
          editingExpenseId={editingExpenseId}
          expenseFormError={expenseFormError}
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
          currencyOptions={tripCurrencyOptions}
          currentPreview={currentPreview}
          onSubmit={handleSaveExpense}
          onCancel={closeExpenseForm}
          expenseFormBottomRef={expenseFormBottomRef}
        />
      )}

      {showTotalCostSheet && (
        <TotalCostSheet
          totalCostByCurrency={totalCostByCurrency}
          formatAmount={formatAmount}
          onClose={() => setShowTotalCostSheet(false)}
          onSelectCurrency={(currency) => {
            setSelectedCurrency(currency);
          }}
        />
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
      {selectedCurrency && (
        <CurrencyExpensesSheet
          selectedCurrency={selectedCurrency}
          selectedCurrencyExpensesByDate={selectedCurrencyExpensesByDate}
          formatExpenseDate={formatExpenseDate}
          formatAmount={formatAmount}
          getMemberName={getMemberName}
          onClose={() => setSelectedCurrency(null)}
        />
      )}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-24 left-1/2 z-50 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-white/60 bg-white/90 shadow-[0_12px_30px_rgba(0,0,0,0.14)] backdrop-blur-xl transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Scroll to top"
        >
          <img
            src="/icons/chevron-up-line.svg"
            alt=""
            className="h-5 w-5"
          />
        </button>
      )}
    </>
  );
}