import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

interface NavigationProps {
  onReportClick: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onReportClick }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Expense Tracker
        </Typography>
        <Box>
          <Button
            color="inherit"
            startIcon={<AssessmentIcon />}
            onClick={onReportClick}
          >
            Monthly Report
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
