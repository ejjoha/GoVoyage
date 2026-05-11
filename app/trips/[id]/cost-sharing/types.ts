export type Currency = string;

export type TripMember = {
  id: number;
  trip_id: number;
  name: string;
};

export type ExpenseParticipant = {
  member_id: number;
};

export type Expense = {
  id: number;
  trip_id: number;
  title: string;
  amount: number;
  currency: Currency;
  expense_date: string;
  paid_by_member_id: number;
  participants: ExpenseParticipant[];
};