export interface Person {
  id: string;
  name: string;
  color: string;
  joinedDate: string;
}

export interface Deduction {
  id: string;
  description: string;
  amount: number;
  excludedParticipants: string[];
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  tax: number;
  paidBy: string; // ID of the person who paid
  participants: string[]; // IDs of people involved in the expense
  excludedParticipants?: string[]; // Making this optional
  deductions: Deduction[];
  category: string;
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

// Interface for storing custom categories
export interface CustomCategory {
  id: string;
  name: string;
  createdAt: string;
}

export type ExpenseCategory = typeof DEFAULT_EXPENSE_CATEGORIES[number] | string;

export interface Balance {
  from: string; // Person who owes
  to: string;   // Person who is owed
  amount: number;
}

export interface PersonBalance {
  personId: string;
  owes: Balance[];      // Money this person owes to others
  isOwed: Balance[];    // Money others owe to this person
  netBalance: number;   // Positive means others owe them, negative means they owe others
}

export interface ExpenseSummary {
  totalAmount: number;
  totalTax: number;
  perPersonAmount: { [key: string]: number };
  balances: PersonBalance[];
}
