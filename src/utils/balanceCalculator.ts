import { Expense, Balance, PersonBalance } from '../types';

export function calculateBalances(expenses: Expense[]): PersonBalance[] {
  const balances = new Map<string, Map<string, number>>();

  // Process each expense
  expenses.forEach(expense => {
    const { paidBy, amount, participants, deductions } = expense;
    
    // Calculate total deductions including tax
    const totalDeductions = deductions.reduce((sum, d) => {
      // Skip tax deductions as they're handled with their associated main deduction
      if (d.description === 'Tax') return sum;
      
      // Find if there's a tax deduction that applies to this deduction
      const taxDeduction = deductions.find(td => 
        td.description === 'Tax' && 
        td.excludedParticipants.length === d.excludedParticipants.length &&
        td.excludedParticipants.every(p => d.excludedParticipants.includes(p))
      );
      
      // Calculate deduction with its tax if applicable
      const deductionWithTax = d.amount + (taxDeduction?.amount || 0);
      return sum + deductionWithTax;
    }, 0);
    
    // Calculate base amount to split (total expense minus deductions)
    const amountToSplit = amount - totalDeductions;
    
    // Calculate per-person share of the base amount
    const numParticipants = participants.length;
    const baseSharePerPerson = amountToSplit / numParticipants;

    // First, distribute the base amount evenly
    participants.forEach(participantId => {
      if (participantId === paidBy) return;

      // Initialize balance maps if they don't exist
      if (!balances.has(participantId)) {
        balances.set(participantId, new Map<string, number>());
      }
      if (!balances.has(paidBy)) {
        balances.set(paidBy, new Map<string, number>());
      }

      // Get the current balance maps
      const participantBalances = balances.get(participantId)!;
      const payerBalances = balances.get(paidBy)!;

      // Update base share
      const currentOwed = participantBalances.get(paidBy) || 0;
      participantBalances.set(paidBy, currentOwed + baseSharePerPerson);

      const currentOwing = payerBalances.get(participantId) || 0;
      payerBalances.set(participantId, currentOwing - baseSharePerPerson);
    });

    // Then, add deductions to specific participants
    deductions.forEach(deduction => {
      // Skip tax deductions as they're handled with their associated main deduction
      if (deduction.description === 'Tax') return;
      
      const excludedParticipants = new Set(deduction.excludedParticipants);
      const includedParticipants = participants.filter(p => !excludedParticipants.has(p));
      
      if (includedParticipants.length > 0) {
        // Find associated tax deduction
        const taxDeduction = deductions.find(td => 
          td.description === 'Tax' && 
          td.excludedParticipants.length === deduction.excludedParticipants.length &&
          td.excludedParticipants.every(p => deduction.excludedParticipants.includes(p))
        );
        
        // Calculate total deduction amount including tax
        const deductionWithTax = deduction.amount + (taxDeduction?.amount || 0);
        const deductionPerPerson = deductionWithTax / includedParticipants.length;
        
        includedParticipants.forEach(participantId => {
          if (participantId === paidBy) return;
          
          const participantBalances = balances.get(participantId)!;
          const payerBalances = balances.get(paidBy)!;
          
          const currentOwed = participantBalances.get(paidBy) || 0;
          participantBalances.set(paidBy, currentOwed + deductionPerPerson);
          
          const currentOwing = payerBalances.get(participantId) || 0;
          payerBalances.set(participantId, currentOwing - deductionPerPerson);
        });
      }
    });
  });

  // Convert the balance map to the required format
  const result: PersonBalance[] = [];
  balances.forEach((personBalances, personId) => {
    const balancesList: Balance[] = [];
    let totalBalance = 0;

    personBalances.forEach((amount, otherPersonId) => {
      if (amount !== 0) {
        balancesList.push({
          personId: otherPersonId,
          amount,
        });
        totalBalance += amount;
      }
    });

    result.push({
      personId,
      balances: balancesList,
      totalBalance,
    });
  });

  return result;
}
