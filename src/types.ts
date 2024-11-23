export interface Person {
  id: string;
  name: string;
  color?: string;
}

export interface Deduction {
  id: string;
  amount: number;
  description: string;
  excludedParticipants: string[];
}

export interface Split {
  participantId: string;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  paidBy: string;
  participants: string[];
  deductions: Deduction[];
  splits: Split[];
}

export interface CustomCategory {
  id: string;
  name: string;
  color: string;
}

export interface Balance {
  personId: string;
  amount: number;
}

export interface PersonBalance {
  personId: string;
  balances: Balance[];
  totalBalance: number;
}

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Entertainment',
  'Transportation',
  'Utilities',
  'Rent',
  'Shopping',
  'Other'
] as const;

export type DefaultExpenseCategory = typeof DEFAULT_EXPENSE_CATEGORIES[number];
