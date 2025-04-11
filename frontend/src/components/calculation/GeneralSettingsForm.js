// frontend/src/components/calculation/GeneralSettingsForm.js
import React from 'react';
import { Box, Typography, TextField, Paper, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useData } from '../../contexts/DataContext';

const GeneralSettingsForm = () => {
  const { generalSettings, setGeneralSettings } = useData();

  const handleChange = (field, value) => {
    setGeneralSettings({
      ...generalSettings,
      [field]: value,
    });
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        General Settings
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={generalSettings.start_date}
            onChange={(newValue) => handleChange('start_date', newValue)}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          />
        </LocalizationProvider>
        
        <TextField
          fullWidth
          margin="normal"
          id="operational_expenses"
          label="Operational Expenses (₺)"
          type="number"
          value={generalSettings.operational_expenses}
          onChange={(e) => handleChange('operational_expenses', parseFloat(e.target.value))}
          InputProps={{
            inputProps: { min: 0, step: 1000 }
          }}
        />
        
        <TextField
          fullWidth
          margin="normal"
          id="min_buffer"
          label="Minimum Buffer (%)"
          type="number"
          value={generalSettings.min_buffer}
          onChange={(e) => handleChange('min_buffer', parseFloat(e.target.value))}
          InputProps={{
            inputProps: { min: 0, step: 0.5 }
          }}
        />
      </Box>
    </Paper>
  );
};

export default GeneralSettingsForm;