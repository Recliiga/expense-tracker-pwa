import React from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Box,
  Tooltip,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Person,
  CalendarToday,
  GetApp,
} from '@mui/icons-material';
import { Person as PersonType, Expense } from '../types';

interface MonthlyOverviewProps {
  expenses: Expense[];
  people: PersonType[];
}

const MonthlyOverview: React.FC<MonthlyOverviewProps> = ({ expenses, people }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Filter expenses for current month
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && 
           expenseDate.getFullYear() === currentYear;
  });

  // Calculate statistics
  const totalExpenses = monthlyExpenses.reduce((sum, exp) => {
    const taxDeduction = exp.deductions.find(d => d.description === 'Tax');
    const taxAmount = taxDeduction ? taxDeduction.amount : 0;
    const totalAmount = exp.amount + exp.deductions.reduce((sum, d) => sum + d.amount, 0);
    return sum + totalAmount;
  }, 0);
  const numberOfTransactions = monthlyExpenses.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleExportCSV = () => {
    const csvData = expenses.map(expense => {
      const taxDeduction = expense.deductions.find(d => d.description === 'Tax');
      const taxAmount = taxDeduction ? taxDeduction.amount : 0;
      const totalAmount = expense.amount + expense.deductions.reduce((sum, d) => sum + d.amount, 0);

      return [
        new Date(expense.date).toLocaleDateString(),
        expense.description,
        expense.category,
        expense.amount.toString(),
        taxAmount.toString(),
        totalAmount.toString(),
        people.find(p => p.id === expense.paidBy)?.name || '',
        expense.participants
          .map(id => people.find(p => p.id === id)?.name || '')
          .join('; '),
      ];
    });

    const csvContent = [
      ['Date', 'Description', 'Category', 'Amount', 'Tax', 'Total', 'Paid By', 'Participants'].join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().slice(0, 7)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Monthly Overview
        </Typography>
        <Button
          startIcon={<GetApp />}
          variant="outlined"
          size="small"
          onClick={handleExportCSV}
        >
          Export CSV
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h5" component="div">
                {formatCurrency(totalExpenses)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Number of Transactions
              </Typography>
              <Typography variant="h5" component="div">
                {numberOfTransactions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MonthlyOverview;
