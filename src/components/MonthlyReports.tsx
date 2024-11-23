import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  InputAdornment,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Search as SearchIcon } from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, parse, startOfMonth, endOfMonth } from 'date-fns';
import { Person, Expense } from '../types';

interface MonthlyReportsProps {
  expenses: Expense[];
  people: Person[];
  onClose?: () => void;
}

const MonthlyReports: React.FC<MonthlyReportsProps> = ({ expenses, people, onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique months from expenses for the month selector
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    expenses.forEach(expense => {
      const monthStr = format(new Date(expense.date), 'yyyy-MM');
      months.add(monthStr);
    });
    return Array.from(months).sort().reverse(); // Most recent first
  }, [expenses]);

  // Filter expenses for the selected month and search term
  const filteredExpenses = useMemo(() => {
    const start = startOfMonth(parse(selectedMonth, 'yyyy-MM', new Date()));
    const end = endOfMonth(start);
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const matchesMonth = expenseDate >= start && expenseDate <= end;
      const matchesSearch = searchTerm === '' || 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        people.find(p => p.id === expense.paidBy)?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesMonth && matchesSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, selectedMonth, searchTerm, people]);

  // Calculate category breakdown for selected month
  const categoryBreakdown = useMemo(() => {
    const start = startOfMonth(parse(selectedMonth, 'yyyy-MM', new Date()));
    const end = endOfMonth(start);
    
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= start && expenseDate <= end;
    });

    const categoryTotals = new Map<string, number>();
    let totalAmount = 0;

    currentMonthExpenses.forEach(expense => {
      const baseAmount = expense.amount;
      totalAmount += baseAmount;

      const currentTotal = categoryTotals.get(expense.category) || 0;
      categoryTotals.set(expense.category, currentTotal + baseAmount);
    });

    return Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [expenses, selectedMonth]);

  // Calculate month-to-month spending
  const monthlySpending = useMemo(() => {
    const monthlyTotals = new Map<string, number>();

    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = format(date, 'MMM yyyy');
      const currentTotal = monthlyTotals.get(monthKey) || 0;
      monthlyTotals.set(monthKey, currentTotal + expense.amount);
    });

    return Array.from(monthlyTotals.entries())
      .map(([month, total]) => ({
        month,
        total
      }))
      .sort((a, b) => {
        const [monthA, yearA] = a.month.split(' ');
        const [monthB, yearB] = b.month.split(' ');
        return new Date(`${monthA} 1, ${yearA}`).getTime() - new Date(`${monthB} 1, ${yearB}`).getTime();
      });
  }, [expenses]);

  // Get past complete months with expenses, excluding current month
  const pastMonthsWithExpenses = useMemo(() => {
    const months = new Set<string>();
    const currentDate = new Date();
    const currentMonth = format(currentDate, 'yyyy-MM');
    
    expenses.forEach(expense => {
      const monthStr = format(new Date(expense.date), 'yyyy-MM');
      if (monthStr < currentMonth) {
        months.add(monthStr);
      }
    });
    
    return Array.from(months)
      .sort()
      .reverse() // Most recent first
      .map(monthStr => {
        const start = startOfMonth(parse(monthStr, 'yyyy-MM', new Date()));
        const end = endOfMonth(start);
        const monthExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= start && expenseDate <= end;
        });

        const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        return {
          monthStr,
          expenses: monthExpenses,
          total
        };
      });
  }, [expenses]);

  const COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#6366F1'  // Indigo
  ];

  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, value, payload } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
      >
        {`${payload.percentage.toFixed(1)}%`}
      </text>
    );
  };

  // Helper function to calculate category breakdown for a set of expenses
  const getCategoryBreakdown = (expenses: Expense[]) => {
    const categoryTotals = new Map<string, number>();
    let totalAmount = 0;

    expenses.forEach(expense => {
      const baseAmount = expense.amount;
      totalAmount += baseAmount;

      const currentTotal = categoryTotals.get(expense.category) || 0;
      categoryTotals.set(expense.category, currentTotal + baseAmount);
    });

    return Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
      }))
      .sort((a, b) => b.percentage - a.percentage);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 4,
          backgroundColor: 'white',
          borderRadius: 2,
          p: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <IconButton 
          onClick={onClose}
          sx={{ 
            mr: 2,
            '&:hover': {
              backgroundColor: '#F1F5F9'
            }
          }}
          aria-label="back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600,
            color: '#1E293B',
            fontSize: { xs: '1.5rem', md: '2rem' }
          }}
        >
          Monthly Reports
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Current Month Category Breakdown */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3,
              borderRadius: 2,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'
              }
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                color: '#1E293B',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Box component="span" sx={{ color: '#3B82F6' }}>●</Box>
              Current Month Categories - {format(new Date(), 'MMMM yyyy')}
            </Typography>
            <Box sx={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.1))' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                    formatter={(value: number, name: string, props: any) => {
                      const item = categoryBreakdown.find(item => item.category === name);
                      return [`$${value.toFixed(2)} (${item?.percentage.toFixed(1)}%)`];
                    }}
                  />
                  <Legend 
                    formatter={(value: string) => (
                      <span style={{ color: '#475569', fontSize: '0.9rem' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Monthly Spending Trend Chart */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3,
              borderRadius: 2,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'
              }
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                color: '#1E293B',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Box component="span" sx={{ color: '#10B981' }}>●</Box>
              Monthly Spending Trend
            </Typography>
            <Box sx={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlySpending}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="month"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fill: '#475569' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value}`}
                    tick={{ fill: '#475569' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total']}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Past Monthly Statements */}
        {pastMonthsWithExpenses.map(({ monthStr, expenses: monthExpenses, total }) => (
          <Grid item xs={12} key={monthStr}>
            <Paper 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'
                }
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  p: 3,
                  borderBottom: '1px solid #E2E8F0'
                }}
              >
                <Typography 
                  variant="h6"
                  sx={{ 
                    fontWeight: 600,
                    color: '#1E293B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Box component="span" sx={{ color: '#6366F1' }}>●</Box>
                  {format(parse(monthStr, 'yyyy-MM', new Date()), 'MMMM yyyy')}
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#3B82F6',
                    fontWeight: 600
                  }}
                >
                  ${total.toFixed(2)}
                </Typography>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Paid By</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569' }} align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {monthExpenses.map((expense) => (
                      <TableRow 
                        key={expense.id}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: '#F8FAFC'
                          }
                        }}
                      >
                        <TableCell sx={{ color: '#475569' }}>{format(new Date(expense.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell sx={{ color: '#1E293B', fontWeight: 500 }}>{expense.description}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 2,
                              py: 0.5,
                              borderRadius: '9999px',
                              backgroundColor: '#F1F5F9',
                              color: '#475569',
                              fontSize: '0.875rem'
                            }}
                          >
                            {expense.category}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#475569' }}>{people.find(p => p.id === expense.paidBy)?.name}</TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            color: '#059669',
                            fontWeight: 600,
                            fontFamily: 'monospace'
                          }}
                        >
                          ${expense.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MonthlyReports;
