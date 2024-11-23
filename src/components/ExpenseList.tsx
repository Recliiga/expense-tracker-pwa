import React, { useState, useMemo } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Box,
  TextField,
  MenuItem,
  Grid,
  Avatar,
  Collapse,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  FilterList,
  Person as PersonIcon,
  ArrowUpward,
  ArrowDownward,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Person, Expense, DEFAULT_EXPENSE_CATEGORIES, CustomCategory } from '../types';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

interface ExpenseListProps {
  expenses: Expense[];
  people: Person[];
  customCategories?: CustomCategory[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense?: (expenseId: string) => void;
  onAddExpense: () => void;
}

interface Filters {
  startDate: Date | null;
  endDate: Date | null;
  minAmount: string;
  maxAmount: string;
  paidBy: string;
  participant: string;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ 
  expenses, 
  people,
  customCategories = [],
  onEditExpense,
  onDeleteExpense,
  onAddExpense
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    startDate: null,
    endDate: null,
    minAmount: '',
    maxAmount: '',
    paidBy: '',
    participant: '',
  });

  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleFilterChange = (field: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const allCategories = [...DEFAULT_EXPENSE_CATEGORIES, ...customCategories.map(c => c.name)];

  const filteredAndSortedExpenses = useMemo(() => {
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        
        if (filters.startDate && expenseDate < filters.startDate) return false;
        if (filters.endDate && expenseDate > filters.endDate) return false;
        
        if (filters.minAmount && expense.amount < parseFloat(filters.minAmount)) return false;
        if (filters.maxAmount && expense.amount > parseFloat(filters.maxAmount)) return false;
        
        if (filters.paidBy && expense.paidBy !== filters.paidBy) return false;
        if (filters.participant && !expense.participants.includes(filters.participant)) return false;
        
        if (selectedCategory && expense.category !== selectedCategory) return false;
        
        return true;
      })
      .sort((a, b) => {
        const multiplier = sortOrder === 'asc' ? 1 : -1;
        if (sortBy === 'date') {
          return multiplier * (new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        return multiplier * (b.amount - a.amount);
      });
  }, [expenses, filters, selectedCategory, sortBy, sortOrder, customCategories]);

  const totalAmount = filteredAndSortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPerson = (id: string) => people.find(p => p.id === id);

  const renderExpenseItem = (expense: Expense) => {
    const payer = getPerson(expense.paidBy);
    const participantsText = expense.participants
      .map(id => getPerson(id)?.name)
      .filter(Boolean)
      .join(', ');

    const taxDeduction = expense.deductions.find(d => d.description === 'Tax');
    const otherDeductions = expense.deductions.filter(d => d.description !== 'Tax');
    const totalAmount = expense.amount + expense.deductions.reduce((sum, d) => sum + d.amount, 0);

    return (
      <ListItem
        key={expense.id}
        sx={{
          borderLeft: 2,
          borderColor: 'primary.main',
          mb: 1,
          bgcolor: 'background.paper',
        }}
      >
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1">
                {expense.description}
              </Typography>
              <Chip
                label={expense.category}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
          }
          secondary={
            <Box>
              <Typography variant="body2" color="text.secondary">
                {format(new Date(expense.date), 'MMM d, yyyy')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paid by: {payer?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Participants: {participantsText}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Base amount: {formatCurrency(expense.amount)}
              </Typography>
              {taxDeduction && (
                <Typography variant="body2" color="text.secondary">
                  Tax ({((taxDeduction.amount / expense.amount) * 100).toFixed(1)}%): {formatCurrency(taxDeduction.amount)}
                </Typography>
              )}
              {otherDeductions.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Other deductions: {formatCurrency(otherDeductions.reduce((sum, d) => sum + d.amount, 0))}
                </Typography>
              )}
            </Box>
          }
        />
        <ListItemSecondaryAction>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" color="primary">
                {formatCurrency(totalAmount)}
              </Typography>
              {expense.splits.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {expense.splits.length} way split
                </Typography>
              )}
            </Box>
            <IconButton
              edge="end"
              aria-label="edit"
              onClick={() => onEditExpense(expense)}
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
            {onDeleteExpense && (
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => onDeleteExpense(expense.id)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Header with Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Recent Expenses
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
            variant="outlined"
            size="small"
          >
            Filters
          </Button>
          <Button
            variant="contained"
            onClick={onAddExpense}
            startIcon={<AddIcon />}
          >
            Add Expense
          </Button>
        </Box>
      </Box>

      {/* Filters Section */}
      <Collapse in={showFilters}>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(date: Date | null) => handleFilterChange('startDate', date)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={(date: Date | null) => handleFilterChange('endDate', date)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Min Amount"
                type="number"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Max Amount"
                type="number"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Paid By"
                value={filters.paidBy}
                onChange={(e) => handleFilterChange('paidBy', e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="">All</MenuItem>
                {people.map((person) => (
                  <MenuItem key={person.id} value={person.id}>
                    {person.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Participant"
                value={filters.participant}
                onChange={(e) => handleFilterChange('participant', e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="">All</MenuItem>
                {people.map((person) => (
                  <MenuItem key={person.id} value={person.id}>
                    {person.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>
      </Collapse>

      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
          >
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="amount">Amount</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {allCategories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <IconButton onClick={toggleSortOrder}>
          {sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
        </IconButton>
      </Box>

      <List>
        {filteredAndSortedExpenses.map(renderExpenseItem)}
        {filteredAndSortedExpenses.length === 0 && (
          <ListItem>
            <ListItemText
              primary="No expenses found"
              secondary="Try adjusting the filters or add a new expense"
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default ExpenseList;
