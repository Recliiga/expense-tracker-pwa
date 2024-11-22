import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import { Person, PersonBalance } from '../types';

interface BalanceOverviewProps {
  balances: PersonBalance[];
  people: Person[];
}

const BalanceOverview: React.FC<BalanceOverviewProps> = ({ balances, people }) => {
  const theme = useTheme();

  const getPerson = (id: string) => people.find(p => p.id === id);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Balance Overview
      </Typography>

      <List>
        {balances.map((balance) => {
          const person = getPerson(balance.personId);
          if (!person) return null;

          return (
            <React.Fragment key={balance.personId}>
              <ListItem
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  py: 2,
                }}
              >
                <Box sx={{ width: '100%', mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: person.color,
                          mr: 1,
                          width: 32,
                          height: 32,
                        }}
                      >
                        {person.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="subtitle1">
                        {person.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={formatAmount(balance.totalBalance)}
                      color={balance.totalBalance >= 0 ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Box>

                  {/* Amounts they owe */}
                  {balance.balances.filter(b => b.amount > 0).length > 0 && (
                    <Box sx={{ ml: 4, mb: 1 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Owes:
                      </Typography>
                      {balance.balances
                        .filter(b => b.amount > 0)
                        .map((debt) => {
                          const owedPerson = getPerson(debt.personId);
                          if (!owedPerson) return null;

                          return (
                            <Typography
                              key={debt.personId}
                              variant="body2"
                              color="text.secondary"
                              sx={{ ml: 2 }}
                            >
                              {owedPerson.name}: {formatAmount(debt.amount)}
                            </Typography>
                          );
                        })}
                    </Box>
                  )}

                  {/* Amounts owed to them */}
                  {balance.balances.filter(b => b.amount < 0).length > 0 && (
                    <Box sx={{ ml: 4 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Is owed:
                      </Typography>
                      {balance.balances
                        .filter(b => b.amount < 0)
                        .map((debt) => {
                          const owingPerson = getPerson(debt.personId);
                          if (!owingPerson) return null;

                          return (
                            <Typography
                              key={debt.personId}
                              variant="body2"
                              color="text.secondary"
                              sx={{ ml: 2 }}
                            >
                              {owingPerson.name}: {formatAmount(-debt.amount)}
                            </Typography>
                          );
                        })}
                    </Box>
                  )}
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
};

export default BalanceOverview;
