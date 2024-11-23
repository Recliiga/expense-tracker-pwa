import { Expense, Person, CustomCategory } from '../types';

export const STORAGE_KEYS = {
  EXPENSES: 'expenses',
  PEOPLE: 'people',
  CUSTOM_CATEGORIES: 'customCategories',
};

export const saveExpenses = (expenses: Expense[]): void => {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
};

export const loadExpenses = (): Expense[] => {
  const savedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  return savedExpenses ? JSON.parse(savedExpenses) : [];
};

export const savePeople = (people: Person[]): void => {
  localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
};

export const loadPeople = (): Person[] => {
  const savedPeople = localStorage.getItem(STORAGE_KEYS.PEOPLE);
  return savedPeople ? JSON.parse(savedPeople) : [];
};

export const saveCustomCategories = (categories: CustomCategory[]): void => {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_CATEGORIES, JSON.stringify(categories));
};

export const loadCustomCategories = (): CustomCategory[] => {
  const savedCategories = localStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
  return savedCategories ? JSON.parse(savedCategories) : [];
};

export const clearAllData = (): void => {
  localStorage.clear(); // Clear all data in localStorage
};

// Function to reset the app to initial state
export const resetApp = (): void => {
  clearAllData();
  window.location.reload(); // Force reload the page
};