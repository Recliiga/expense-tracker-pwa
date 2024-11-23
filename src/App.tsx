import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Modal,
  Fab,
  useTheme,
  useMediaQuery,
  Grid,
  Paper,
  Button,
  Dialog,
  DialogContent,
  ThemeProvider,
  CssBaseline,
  Zoom,
  Fade,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import theme from './theme';
import Navigation from './components/Navigation';
import GroupMembers from './components/GroupMembers';
import AddExpense from './components/AddExpense';
import BalanceOverview from './components/BalanceOverview';
import ExpenseList from './components/ExpenseList';
import MonthlyOverview from './components/MonthlyOverview';
import MonthlyReports from './components/MonthlyReports';
import { Person, Expense, CustomCategory } from './types';
import { calculateBalances } from './utils/balanceCalculator';
import { saveExpenses, loadExpenses, savePeople, loadPeople, saveCustomCategories, loadCustomCategories } from './utils/storage';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '95%',
  maxWidth: 1200,
  height: '90vh',
  bgcolor: 'background.paper',
  borderRadius: theme.shape.borderRadius,
  boxShadow: 24,
  p: 4,
  overflow: 'auto'
};

function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
  const [openMonthlyReports, setOpenMonthlyReports] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleAddPerson = (person: Person) => {
    setPeople([...people, person]);
  };

  const handleUpdatePerson = (updatedPerson: Person) => {
    setPeople(people.map(p => p.id === updatedPerson.id ? updatedPerson : p));
  };

  const handleDeletePerson = (personId: string) => {
    setPeople(people.filter(p => p.id !== personId));
  };

  const handleAddExpense = (expense: Expense) => {
    setExpenses(prev => [...prev, expense]);
    setOpenExpenseDialog(false); // Close the dialog after adding
  };

  const handleUpdateExpense = (updatedExpense: Expense) => {
    setExpenses(prev => prev.map(exp => 
      exp.id === updatedExpense.id ? updatedExpense : exp
    ));
    setExpenseToEdit(null);
    setOpenExpenseDialog(false); // Close the dialog after updating
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
  };

  const handleAddCustomCategory = (category: CustomCategory) => {
    setCustomCategories(prev => [...prev, category]);
  };

  const handleOpenAddExpense = () => {
    setExpenseToEdit(null);
    setOpenExpenseDialog(true);
  };

  const balances = calculateBalances(expenses);

  // Load data from localStorage on startup
  useEffect(() => {
    setPeople(loadPeople());
    setExpenses(loadExpenses());
    setCustomCategories(loadCustomCategories());
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    savePeople(people);
  }, [people]);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveCustomCategories(customCategories);
  }, [customCategories]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        pb: 8, // Add padding bottom for FAB
      }}>
        <Navigation 
          onOpenMonthlyReports={() => setOpenMonthlyReports(true)}
        />
        
        <Container maxWidth="lg" sx={{ mt: 3 }}>
          <Fade in timeout={800}>
            <Grid container spacing={3}>
              {/* Left Column - Group Members and Balance Overview */}
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    mb: 3,
                    backgroundColor: 'grey.100'
                  }}
                >
                  <GroupMembers
                    people={people}
                    onAddPerson={handleAddPerson}
                    onUpdatePerson={handleUpdatePerson}
                    onDeletePerson={handleDeletePerson}
                  />
                </Paper>

                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2,
                    backgroundColor: 'grey.100'
                  }}
                >
                  <BalanceOverview
                    balances={balances}
                    people={people}
                  />
                </Paper>
              </Grid>

              {/* Right Column - Monthly Overview and Expense List */}
              <Grid item xs={12} md={8}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    mb: 3,
                    backgroundColor: 'grey.100'
                  }}
                >
                  <MonthlyOverview 
                    expenses={expenses}
                    people={people}
                  />
                </Paper>

                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'grey.100',
                    minHeight: 400 
                  }}
                >
                  <ExpenseList
                    expenses={expenses}
                    people={people}
                    onDeleteExpense={handleDeleteExpense}
                    onEditExpense={handleEditExpense}
                    onAddExpense={handleOpenAddExpense}
                    customCategories={customCategories}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Fade>
        </Container>

        <Zoom in>
          <Fab
            color="primary"
            aria-label="add expense"
            onClick={handleOpenAddExpense}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              transition: '0.3s',
              '&:hover': {
                transform: 'scale(1.1)',
              }
            }}
          >
            <AddIcon />
          </Fab>
        </Zoom>

        <Dialog
          open={openExpenseDialog}
          onClose={() => setOpenExpenseDialog(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogContent>
            <AddExpense
              people={people}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              expenseToEdit={expenseToEdit || undefined}
              customCategories={customCategories}
              onAddCustomCategory={handleAddCustomCategory}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={openMonthlyReports}
          onClose={() => setOpenMonthlyReports(false)}
          maxWidth="lg"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogContent sx={{ p: 0 }}>
            <MonthlyReports
              expenses={expenses}
              people={people}
              onClose={() => setOpenMonthlyReports(false)}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App;
