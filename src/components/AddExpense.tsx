import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  IconButton,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Collapse,
  Chip,
  Divider
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { Person, Expense, Deduction, DEFAULT_EXPENSE_CATEGORIES, CustomCategory } from '../types';

interface AddExpenseProps {
  onAddExpense: (expense: Expense) => void;
  onUpdateExpense?: (expense: Expense) => void;
  onAddCustomCategory?: (category: CustomCategory) => void;
  people: Person[];
  expenseToEdit?: Expense;
  onCancel?: () => void;
  customCategories?: CustomCategory[];
}

const AddExpense: React.FC<AddExpenseProps> = ({
  onAddExpense,
  onUpdateExpense,
  onAddCustomCategory,
  people,
  expenseToEdit,
  onCancel,
  customCategories = [],
}) => {
  const [description, setDescription] = useState(expenseToEdit?.description || '');
  const [amount, setAmount] = useState<number>(expenseToEdit?.amount || 0);
  const [amountFocused, setAmountFocused] = useState(false);
  const [paidBy, setPaidBy] = useState(expenseToEdit?.paidBy || '');
  const [participants, setParticipants] = useState<string[]>(expenseToEdit?.participants || []);
  const [category, setCategory] = useState(expenseToEdit?.category || DEFAULT_EXPENSE_CATEGORIES[0]);
  const [deductions, setDeductions] = useState<Deduction[]>(expenseToEdit?.deductions || []);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');
  const [showDeductionInput, setShowDeductionInput] = useState(false);
  const [deductionInput, setDeductionInput] = useState('');
  const [deductionDescription, setDeductionDescription] = useState('');
  const [taxInput, setTaxInput] = useState('');
  const [excludedParticipants, setExcludedParticipants] = useState<string[]>([]);

  const allCategories = [...DEFAULT_EXPENSE_CATEGORIES, ...customCategories.map(c => c.name)];

  useEffect(() => {
    if (expenseToEdit) {
      setDescription(expenseToEdit.description);
      setAmount(expenseToEdit.amount);
      setPaidBy(expenseToEdit.paidBy);
      setParticipants(expenseToEdit.participants);
      setCategory(expenseToEdit.category);
      setDeductions(expenseToEdit.deductions || []);
    }
  }, [expenseToEdit]);

  const calculateTotalWithDeductions = () => {
    return deductions.reduce((sum, d) => {
      // Skip tax deductions as they're handled with their associated main deduction
      if (d.description === 'Tax') return sum;
      
      // Find associated tax deduction
      const taxDeduction = deductions.find(td => 
        td.description === 'Tax' && 
        td.excludedParticipants.length === d.excludedParticipants.length &&
        td.excludedParticipants.every(p => d.excludedParticipants.includes(p))
      );
      
      // Add deduction amount plus its tax if applicable
      return sum + d.amount + (taxDeduction?.amount || 0);
    }, 0);
  };

  const handleAddDeduction = () => {
    const deductionAmount = parseFloat(deductionInput);
    const taxPercentage = parseFloat(taxInput);

    if (!isNaN(deductionAmount) && deductionAmount > 0) {
      // Create the main deduction
      const deduction: Deduction = {
        id: uuidv4(),
        description: deductionDescription || 'Deduction',
        amount: deductionAmount,
        excludedParticipants: excludedParticipants
      };

      // If tax percentage is specified, create a tax deduction
      if (!isNaN(taxPercentage) && taxPercentage > 0) {
        const taxAmount = deductionAmount * (taxPercentage / 100);
        const taxDeduction: Deduction = {
          id: uuidv4(),
          description: 'Tax',
          amount: taxAmount,
          excludedParticipants: [...excludedParticipants]
        };
        setDeductions([...deductions, deduction, taxDeduction]);
      } else {
        setDeductions([...deductions, deduction]);
      }

      // Reset inputs
      setDeductionInput('');
      setDeductionDescription('');
      setTaxInput('');
      setExcludedParticipants([]);
      setShowDeductionInput(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!paidBy) {
      setError('Please select who paid');
      return;
    }

    if (participants.length === 0) {
      setError('Please select at least one participant');
      return;
    }

    const splitAmounts = calculateSplitAmounts();
    const expense: Expense = {
      id: expenseToEdit?.id || uuidv4(),
      description,
      amount,
      date: expenseToEdit?.date || new Date().toISOString(),
      paidBy,
      participants,
      category,
      deductions,
      splits: splitAmounts.map(({ participantId, amount }) => ({
        participantId,
        amount
      }))
    };

    if (expenseToEdit && onUpdateExpense) {
      onUpdateExpense(expense);
    } else {
      onAddExpense(expense);
    }

    if (!expenseToEdit) {
      resetForm();
    }
  };

  const resetForm = () => {
    setDescription('');
    setAmount(0);
    setPaidBy('');
    setParticipants([]);
    setCategory(DEFAULT_EXPENSE_CATEGORIES[0]);
    setDeductions([]);
    setError('');
  };

  const handleParticipantToggle = (personId: string) => {
    setParticipants(prev => {
      if (prev.includes(personId)) {
        return prev.filter(id => id !== personId);
      } else {
        return [...prev, personId];
      }
    });
  };

  const handleSelectPayer = (event: SelectChangeEvent) => {
    const payerId = event.target.value;
    setPaidBy(payerId);
    // Automatically include the payer as a participant
    if (!participants.includes(payerId)) {
      setParticipants(prev => [...prev, payerId]);
    }
  };

  const calculateSplitAmounts = () => {
    const totalDeductions = calculateTotalWithDeductions();
    const amountToSplit = amount - totalDeductions;
    const participantCount = participants.length;
    
    if (participantCount === 0) return [];
    
    const baseSharePerPerson = amountToSplit / participantCount;
    
    // Initialize splits with base share
    const splits = participants.map(participantId => ({
      participantId,
      amount: baseSharePerPerson
    }));
    
    // Add deduction amounts to specific participants
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
          const split = splits.find(s => s.participantId === participantId);
          if (split) {
            split.amount += deductionPerPerson;
          }
        });
      }
    });
    
    return splits;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
    setAmount(isNaN(value) ? 0 : value);
  };

  const handleAmountFocus = () => {
    setAmountFocused(true);
  };

  const handleAmountBlur = () => {
    setAmountFocused(false);
    if (amount === 0) {
      setAmount(0);
    }
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim() && onAddCustomCategory) {
      const customCategory: CustomCategory = {
        id: uuidv4(),
        name: newCategory.trim(),
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      };
      onAddCustomCategory(customCategory);
      setCategory(newCategory.trim());
      setNewCategory('');
      setShowNewCategoryInput(false);
    }
  };

  const getPerson = (id: string) => people.find(person => person.id === id);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                {allCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
                <MenuItem value="__add_new__" onClick={() => setShowNewCategoryInput(true)}>
                  <AddIcon sx={{ mr: 1 }} /> Add New Category
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Collapse in={showNewCategoryInput}>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="New Category Name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleAddNewCategory}
                disabled={!newCategory.trim()}
              >
                Add
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowNewCategoryInput(false);
                  setNewCategory('');
                }}
              >
                Cancel
              </Button>
            </Box>
          </Collapse>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Amount"
              type="number"
              value={amountFocused ? (amount === 0 ? '' : amount) : amount}
              onChange={handleAmountChange}
              onFocus={handleAmountFocus}
              onBlur={handleAmountBlur}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Paid By</InputLabel>
              <Select
                value={paidBy}
                onChange={handleSelectPayer}
                label="Paid By"
              >
                {people.map((person) => (
                  <MenuItem key={person.id} value={person.id}>
                    {person.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Split Between
            </Typography>
            <FormGroup>
              {people.map((person) => (
                <FormControlLabel
                  key={person.id}
                  control={
                    <Checkbox
                      checked={participants.includes(person.id)}
                      onChange={() => handleParticipantToggle(person.id)}
                      disabled={person.id === paidBy} // Can't uncheck the payer
                    />
                  }
                  label={person.name}
                />
              ))}
            </FormGroup>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Deductions</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setShowDeductionInput(true)}
                variant="outlined"
                size="small"
              >
                Add Deduction
              </Button>
            </Box>

            <Collapse in={showDeductionInput}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={deductionDescription}
                      onChange={(e) => setDeductionDescription(e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Amount"
                      value={deductionInput}
                      onChange={(e) => setDeductionInput(e.target.value)}
                      type="number"
                      size="small"
                      inputProps={{ min: 0, step: 0.01 }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Tax Percentage (optional)"
                      value={taxInput}
                      onChange={(e) => setTaxInput(e.target.value)}
                      type="number"
                      size="small"
                      inputProps={{ min: 0, step: 0.1 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Excluded Participants</InputLabel>
                      <Select
                        multiple
                        value={excludedParticipants}
                        onChange={(e) => setExcludedParticipants(typeof e.target.value === 'string' ? [e.target.value] : e.target.value)}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip
                                key={value}
                                label={getPerson(value)?.name}
                                size="small"
                              />
                            ))}
                          </Box>
                        )}
                      >
                        {participants.map((participantId) => (
                          <MenuItem key={participantId} value={participantId}>
                            {getPerson(participantId)?.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setShowDeductionInput(false);
                          setDeductionInput('');
                          setDeductionDescription('');
                          setTaxInput('');
                          setExcludedParticipants([]);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleAddDeduction}
                        disabled={!deductionInput.trim()}
                      >
                        Add
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Collapse>

            {/* Existing Deductions List */}
            {deductions.map((deduction, index) => (
              <Paper key={deduction.id} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2">
                        {deduction.description} {deduction.description === 'Tax' && '(Auto-calculated)'}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const newDeductions = [...deductions];
                          if (deduction.description === 'Tax') {
                            // If removing a tax deduction, also remove its parent deduction
                            const parentIndex = newDeductions.findIndex(d => 
                              d.excludedParticipants.length === deduction.excludedParticipants.length &&
                              d.excludedParticipants.every(p => deduction.excludedParticipants.includes(p)) &&
                              d.description !== 'Tax'
                            );
                            if (parentIndex !== -1) {
                              newDeductions.splice(parentIndex, 1);
                            }
                          }
                          newDeductions.splice(index, 1);
                          setDeductions(newDeductions);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Amount: {formatCurrency(deduction.amount)}
                    </Typography>
                    {deduction.excludedParticipants.length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Excluded: {deduction.excludedParticipants.map(id => getPerson(id)?.name).join(', ')}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle1" gutterBottom>
                Summary
              </Typography>
              <Typography variant="body2">
                Base Amount: {formatCurrency(amount)}
              </Typography>
              {deductions.map((deduction) => (
                <Typography key={deduction.id} variant="body2">
                  {deduction.description}: {formatCurrency(deduction.amount)}
                </Typography>
              ))}
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Total Amount: {formatCurrency(calculateTotalWithDeductions())}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Split Preview
              </Typography>
              {calculateSplitAmounts().map(({ participantId, amount }) => {
                const person = getPerson(participantId);
                return person ? (
                  <Typography key={participantId} variant="body2">
                    {person.name}: {formatCurrency(amount)}
                  </Typography>
                ) : null;
              })}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {onCancel && (
                <Button onClick={onCancel} variant="outlined" color="secondary">
                  Cancel
                </Button>
              )}
              <Button type="submit" variant="contained" color="primary">
                {expenseToEdit ? 'Update Expense' : 'Add Expense'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default AddExpense;
