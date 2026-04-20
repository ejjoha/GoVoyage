import { supabase } from "@/lib/supabase";
import type { Trip } from "../types";
import type { Expense, TripMember } from "./types";

export async function fetchTripById(tripId: number): Promise<Trip | null> {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .single();

  if (error) {
    console.error("Error loading trip:", error);
    return null;
  }

  return data as Trip;
}

export async function fetchTripMembersByTripId(
  tripId: number
): Promise<TripMember[]> {
  const { data, error } = await supabase
    .from("trip_members")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error loading trip members:", error);
    return [];
  }

  return (data || []) as TripMember[];
}

export async function fetchExpensesByTripId(
  tripId: number
): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("trip_id", tripId)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading expenses:", error);
    return [];
  }

  const expenseRows = (data || []) as Omit<Expense, "participants">[];

  if (expenseRows.length === 0) {
    return [];
  }

  const expenseIds = expenseRows.map((expense) => expense.id);

  const { data: participantData, error: participantError } = await supabase
    .from("expense_participants")
    .select("expense_id, member_id")
    .in("expense_id", expenseIds);

  if (participantError) {
    console.error("Error loading expense participants:", participantError);

    return expenseRows.map((expense) => ({
      ...expense,
      participants: [],
    }));
  }

  const participantsByExpenseId = new Map<
    number,
    { member_id: number }[]
  >();

  for (const row of participantData || []) {
    const expenseId = Number(row.expense_id);
    const current = participantsByExpenseId.get(expenseId) || [];
    current.push({ member_id: Number(row.member_id) });
    participantsByExpenseId.set(expenseId, current);
  }

  return expenseRows.map((expense) => ({
    ...expense,
    participants: participantsByExpenseId.get(expense.id) || [],
  }));
}

export async function createExpense(input: {
  tripId: number;
  title: string;
  amount: number;
  currency: Expense["currency"];
  expenseDate: string;
  paidByMemberId: number;
  participantIds: number[];
}) {
  const {
    tripId,
    title,
    amount,
    currency,
    expenseDate,
    paidByMemberId,
    participantIds,
  } = input;

  const { data, error: insertError } = await supabase
    .from("expenses")
    .insert({
      trip_id: tripId,
      title,
      amount,
      currency,
      expense_date: expenseDate,
      paid_by_member_id: paidByMemberId,
    })
    .select()
    .single();

  if (insertError || !data) {
    console.error("Error saving expense:", insertError);
    return { success: false as const, message: "Could not save expense" };
  }

  const participantRows = participantIds.map((memberId) => ({
    expense_id: data.id,
    member_id: memberId,
  }));

  const { error: participantInsertError } = await supabase
    .from("expense_participants")
    .insert(participantRows);

  if (participantInsertError) {
    console.error(
      "Error saving expense participants:",
      participantInsertError
    );
    return {
      success: false as const,
      message: "Expense saved, but participants could not be saved",
    };
  }

  return { success: true as const };
}

export async function updateExpense(input: {
  expenseId: number;
  tripId: number;
  title: string;
  amount: number;
  currency: Expense["currency"];
  expenseDate: string;
  paidByMemberId: number;
  participantIds: number[];
}) {
  const {
    expenseId,
    tripId,
    title,
    amount,
    currency,
    expenseDate,
    paidByMemberId,
    participantIds,
  } = input;

  const { error: updateError } = await supabase
    .from("expenses")
    .update({
      trip_id: tripId,
      title,
      amount,
      currency,
      expense_date: expenseDate,
      paid_by_member_id: paidByMemberId,
    })
    .eq("id", expenseId);

  if (updateError) {
    console.error("Error updating expense:", updateError);
    return { success: false as const, message: "Could not update expense" };
  }

  const { error: deleteParticipantsError } = await supabase
    .from("expense_participants")
    .delete()
    .eq("expense_id", expenseId);

  if (deleteParticipantsError) {
    console.error(
      "Error replacing expense participants:",
      deleteParticipantsError
    );
    return {
      success: false as const,
      message: "Expense updated, but participants could not be updated",
    };
  }

  const participantRows = participantIds.map((memberId) => ({
    expense_id: expenseId,
    member_id: memberId,
  }));

  const { error: insertParticipantsError } = await supabase
    .from("expense_participants")
    .insert(participantRows);

  if (insertParticipantsError) {
    console.error(
      "Error adding expense participants:",
      insertParticipantsError
    );
    return {
      success: false as const,
      message: "Expense updated, but participants could not be saved",
    };
  }

  return { success: true as const };
}

export async function deleteExpenseById(expenseId: number) {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  if (error) {
    console.error("Error deleting expense:", error);
    return { success: false as const, message: "Could not delete expense" };
  }

  return { success: true as const };
}