import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Container,
  Slide,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';

interface NavigationProps {
  onOpenMonthlyReports: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onOpenMonthlyReports }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Slide appear={false} direction="down" in>
      <AppBar 
        position="sticky"
        elevation={0}
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ height: 64 }}>
            <WalletIcon 
              sx={{ 
                mr: 1.5,
                color: theme.palette.primary.main,
                fontSize: 28
              }} 
            />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                fontWeight: 600,
                color: 'text.primary',
                letterSpacing: '-0.5px'
              }}
            >
              Expense Tracker
            </Typography>
            <Box>
              {isMobile ? (
                <Tooltip title="Monthly Reports">
                  <IconButton
                    color="primary"
                    onClick={onOpenMonthlyReports}
                    size="large"
                  >
                    <AssessmentIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AssessmentIcon />}
                  onClick={onOpenMonthlyReports}
                  sx={{
                    borderRadius: '20px',
                    px: 2,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                    },
                  }}
                >
                  Monthly Reports
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Slide>
  );
};

export default Navigation;
