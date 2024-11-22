import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  useTheme,
  IconButton,
} from '@mui/material';
import {
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { Expense, Person } from '../types';
import { format, startOfMonth, eachDayOfInterval } from 'date-fns';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface MonthlyReportProps {
  expenses: Expense[];
  people: Person[];
  onClose?: () => void;
}

interface DailyExpense {
  date: string;
  amount: number;
}

interface CategoryExpense {
  category: string;
  amount: number;
  percentage: number;
}

interface PersonExpense {
  name: string;
  paid: number;
  fairShare: number;
  balance: number;
}

interface PieChartData {
  category: string;
  amount: number;
  percentage: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1 }}>
        <Typography variant="body2">
          {payload[0].name}: ${payload[0].value.toFixed(2)}
        </Typography>
      </Paper>
    );
  }
  return null;
};

const MonthlyReport: React.FC<MonthlyReportProps> = ({ expenses, people, onClose }) => {
  const theme = useTheme();
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const {
    totalBaseAmount,
    totalTaxAmount,
    totalWithDeductions,
    categoryBreakdown,
    dailyExpenses,
    personExpenses,
    topExpenses,
    monthlySpendingTrend
  } = useMemo(() => {
    const categoryTotals = new Map<string, { base: number; tax: number; total: number }>();
    const personTotals = new Map<string, { base: number; tax: number; total: number }>();
    
    let totalBaseAmount = 0;
    let totalTaxAmount = 0;
    let totalWithDeductions = 0;

    expenses.forEach(expense => {
      const taxDeduction = expense.deductions.find(d => d.description === 'Tax');
      const taxAmount = taxDeduction ? taxDeduction.amount : 0;
      const totalAmount = expense.amount + expense.deductions.reduce((sum, d) => sum + d.amount, 0);

      // Update totals
      totalBaseAmount += expense.amount;
      totalTaxAmount += taxAmount;
      totalWithDeductions += totalAmount;

      // Update category totals
      const categoryTotal = categoryTotals.get(expense.category) || { base: 0, tax: 0, total: 0 };
      categoryTotal.base += expense.amount;
      categoryTotal.tax += taxAmount;
      categoryTotal.total += totalAmount;
      categoryTotals.set(expense.category, categoryTotal);

      // Update person totals
      const payer = people.find(p => p.id === expense.paidBy);
      if (payer) {
        const personTotal = personTotals.get(payer.id) || { base: 0, tax: 0, total: 0 };
        personTotal.base += expense.amount;
        personTotal.tax += taxAmount;
        personTotal.total += totalAmount;
        personTotals.set(payer.id, personTotal);
      }
    });

    // Process category breakdown into chart data
    const categoryBreakdown = Array.from(categoryTotals.entries()).map(([category, totals]) => ({
      category,
      amount: totals.total,
      percentage: (totals.total / totalWithDeductions) * 100
    }));

    // Process daily expenses into chart data
    const today = new Date();
    const monthStart = startOfMonth(today);
    const dailyExpenses = eachDayOfInterval({ start: monthStart, end: today })
      .map(date => ({
        date: format(date, 'MMM dd'),
        amount: 0 // Update this to calculate daily expenses
      }));

    // Process person expenses into chart data
    const personExpenses = people.map(person => ({
      name: person.name,
      paid: personTotals.get(person.id)?.total || 0,
      fairShare: 0, // Update this to calculate fair share
      balance: 0 // Update this to calculate balance
    }));

    // Get top 5 expenses
    const topExpenses = [...expenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const generateSpendingTrendData = () => {
      const monthlyData = new Map<string, { total: number; base: number }>();

      expenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const baseAmount = expense.amount - expense.deductions.reduce((sum, d) => {
          if (d.description === 'Tax') return sum;
          const taxDeduction = expense.deductions.find(td => 
            td.description === 'Tax' && 
            td.excludedParticipants.length === d.excludedParticipants.length &&
            td.excludedParticipants.every(p => d.excludedParticipants.includes(p))
          );
          return sum + d.amount + (taxDeduction?.amount || 0);
        }, 0);

        const currentData = monthlyData.get(monthKey) || { total: 0, base: 0 };
        monthlyData.set(monthKey, {
          total: currentData.total + expense.amount,
          base: currentData.base + baseAmount
        });
      });

      // Convert to array and sort by date
      const sortedData = Array.from(monthlyData.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, amounts]) => ({
          month,
          total: amounts.total,
          base: amounts.base
        }));

      return sortedData;
    };

    const monthlySpendingTrend = generateSpendingTrendData();

    return {
      totalBaseAmount,
      totalTaxAmount,
      totalWithDeductions,
      categoryBreakdown,
      dailyExpenses,
      personExpenses,
      topExpenses,
      monthlySpendingTrend
    };
  }, [expenses, people]);

  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
    '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'
  ];

  const renderCustomizedLabel = ({ value, percent }: any) => {
    return `${value} (${percent}%)`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={onClose}
          sx={{ mr: 2 }}
          aria-label="back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          Monthly Report
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Monthly Spending Trend */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Spending Trend
            </Typography>
            <Box sx={{ height: 500 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlySpendingTrend}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value) => {
                      const [year, month] = value.split('-');
                      return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' })} ${year}`;
                    }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                    labelFormatter={(label) => {
                      const [year, month] = label.split('-');
                      return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' })} ${year}`;
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#8884d8" 
                    name="Total Spending"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="base" 
                    stroke="#82ca9d" 
                    name="Base Spending"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Category Distribution and Individual Spending side by side */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '600px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Category Distribution
            </Typography>
            <Box sx={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius="90%"
                    fill="#8884d8"
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '600px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Individual Spending
            </Typography>
            <Box sx={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={personExpenses}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} />
                  <Tooltip 
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                  />
                  <Legend />
                  <Bar dataKey="total" name="Total Amount" fill="#8884d8" />
                  <Bar dataKey="base" name="Base Amount" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MonthlyReport;
