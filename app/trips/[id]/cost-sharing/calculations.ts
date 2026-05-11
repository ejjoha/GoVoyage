import type { Currency, Expense } from "./types";

export function calculateExpensePreview(params: {
  amount: string;
  currency: Currency;
  paidByMemberId: number | null;
  selectedParticipantIds: number[];
  getMemberName: (memberId: number) => string;
}) {
  const {
    amount,
    currency,
    paidByMemberId,
    selectedParticipantIds,
    getMemberName,
  } = params;

  const parsedAmount = Number(amount);
  const uniqueParticipantIds = [...new Set(selectedParticipantIds)];

  if (
    !parsedAmount ||
    parsedAmount <= 0 ||
    uniqueParticipantIds.length === 0 ||
    !paidByMemberId
  ) {
    return null;
  }

  const sharePerPerson = parsedAmount / uniqueParticipantIds.length;
  const payerName = getMemberName(paidByMemberId);
  const payerIncluded = uniqueParticipantIds.includes(paidByMemberId);

  const oweLines = uniqueParticipantIds
    .filter((memberId) => memberId !== paidByMemberId)
    .map((memberId) => ({
      from: getMemberName(memberId),
      to: payerName,
      amount: sharePerPerson,
      currency,
    }));

  return {
    sharePerPerson,
    payerIncluded,
    oweLines,
    currency,
  };
}

export function calculateGroupedSummary(params: {
  expenses: Expense[];
  currencies: Currency[];
  getMemberName: (memberId: number) => string;
}) {
  const { expenses, currencies, getMemberName } = params;

  const rawDebts = new Map<
    string,
    {
      fromId: number;
      toId: number;
      currency: Currency;
      amount: number;
    }
  >();

  for (const expense of expenses) {
    const participantIds = [
      ...new Set(expense.participants.map((participant) => participant.member_id)),
    ];

    if (participantIds.length === 0) continue;

    const sharePerPerson = Number(expense.amount) / participantIds.length;

    for (const participantId of participantIds) {
      if (participantId === expense.paid_by_member_id) continue;

      const key = `${expense.currency}__${participantId}__${expense.paid_by_member_id}`;
      const existing = rawDebts.get(key);

      if (existing) {
        existing.amount += sharePerPerson;
      } else {
        rawDebts.set(key, {
          fromId: participantId,
          toId: expense.paid_by_member_id,
          currency: expense.currency,
          amount: sharePerPerson,
        });
      }
    }
  }

  const grouped: Record<
    Currency,
    { from: string; to: string; currency: Currency; amount: number }[]
  > = {
    EUR: [],
    GBP: [],
    IDR: [],
    NOK: [],
    SDG: [],
    THB: [],
    USD: [],
  };

  const processedPairs = new Set<string>();

  for (const debt of rawDebts.values()) {
    const pairKey = `${debt.currency}__${Math.min(debt.fromId, debt.toId)}__${Math.max(debt.fromId, debt.toId)}`;

    if (processedPairs.has(pairKey)) continue;
    processedPairs.add(pairKey);

    const forwardAmount =
      rawDebts.get(`${debt.currency}__${debt.fromId}__${debt.toId}`)?.amount ?? 0;

    const backwardAmount =
      rawDebts.get(`${debt.currency}__${debt.toId}__${debt.fromId}`)?.amount ?? 0;

    const netAmount = forwardAmount - backwardAmount;

    if (Math.abs(netAmount) < 0.001) continue;

    if (netAmount > 0) {
      grouped[debt.currency] = grouped[debt.currency] ?? [];
      grouped[debt.currency].push({
        from: getMemberName(debt.fromId),
        to: getMemberName(debt.toId),
        currency: debt.currency,
        amount: netAmount,
      });
    } else {
      grouped[debt.currency].push({
        from: getMemberName(debt.toId),
        to: getMemberName(debt.fromId),
        currency: debt.currency,
        amount: Math.abs(netAmount),
      });
    }
  }

  for (const currencyCode of currencies) {
    grouped[currencyCode] = grouped[currencyCode] ?? [];

    grouped[currencyCode].sort((a, b) => {
      if (a.to === b.to) return a.from.localeCompare(b.from);
      return a.to.localeCompare(b.to);
    });
  }

  return grouped;
}