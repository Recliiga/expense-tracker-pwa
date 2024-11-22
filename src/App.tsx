import React, { useState } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Navigation from './components/Navigation';
import GroupMembers from './components/GroupMembers';
import AddExpense from './components/AddExpense';
import BalanceOverview from './components/BalanceOverview';
import ExpenseList from './components/ExpenseList';
import MonthlyOverview from './components/MonthlyOverview';
import MonthlyReport from './components/MonthlyReport';
import { Person, Expense, CustomCategory } from './types';
import { calculateBalances } from './utils/balanceCalculator';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '95%',
  maxWidth: 1200,
  height: '90vh',
  bgcolor: 'background.paper',
  borderRadius: 1,
  boxShadow: 24,
  p: 4,
  overflow: 'auto'
};

function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [openMonthlyReport, setOpenMonthlyReport] = useState(false);
  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);

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
    setShowAddExpense(false);
  };

  const handleUpdateExpense = (updatedExpense: Expense) => {
    setExpenses(prev => prev.map(exp => 
      exp.id === updatedExpense.id ? updatedExpense : exp
    ));
    setExpenseToEdit(null);
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

  return (
    <Box sx={{ pb: 7 }}>
      <Navigation
        onReportClick={() => setOpenMonthlyReport(true)}
      />
      
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {/* Left Column - Group Members and Balances */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <GroupMembers
                people={people}
                onAddPerson={handleAddPerson}
                onUpdatePerson={handleUpdatePerson}
                onDeletePerson={handleDeletePerson}
              />
            </Paper>

            {people.length > 0 && (
              <BalanceOverview
                balances={balances}
                people={people}
              />
            )}
          </Grid>

          {/* Right Column - Monthly Overview and Expense List */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <MonthlyOverview
                expenses={expenses}
                people={people}
              />
            </Paper>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  {!expenseToEdit && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setShowAddExpense(true)}
                      startIcon={<AddIcon />}
                      fullWidth
                    >
                      Add New Expense
                    </Button>
                  )}
                </Box>

                <Dialog
                  open={showAddExpense || expenseToEdit !== null || openExpenseDialog}
                  onClose={() => {
                    setShowAddExpense(false);
                    setExpenseToEdit(null);
                    setOpenExpenseDialog(false);
                  }}
                  maxWidth="md"
                  fullWidth
                >
                  <DialogContent>
                    <AddExpense
                      onAddExpense={handleAddExpense}
                      onUpdateExpense={handleUpdateExpense}
                      onAddCustomCategory={handleAddCustomCategory}
                      people={people}
                      customCategories={customCategories}
                      expenseToEdit={expenseToEdit || undefined}
                      onCancel={() => {
                        setShowAddExpense(false);
                        setExpenseToEdit(null);
                        setOpenExpenseDialog(false);
                      }}
                    />
                  </DialogContent>
                </Dialog>

                <ExpenseList
                  expenses={expenses}
                  people={people}
                  customCategories={customCategories}
                  onEditExpense={handleEditExpense}
                  onDeleteExpense={handleDeleteExpense}
                  onAddExpense={handleOpenAddExpense}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* Monthly Report Modal */}
      <Modal
        open={openMonthlyReport}
        onClose={() => setOpenMonthlyReport(false)}
      >
        <Box sx={modalStyle}>
          <MonthlyReport 
            expenses={expenses} 
            people={people} 
            onClose={() => setOpenMonthlyReport(false)}
          />
        </Box>
      </Modal>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: isMobile ? 16 : 32,
          right: isMobile ? 16 : 32,
        }}
        onClick={() => setShowAddExpense(true)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default App;
