// frontend/src/components/calculation/TrancheBForm.js
import React from 'react';
import { Box, Typography, TextField, Paper } from '@mui/material';
import { useData } from '../../contexts/DataContext';

const TrancheBForm = () => {
  const { trancheB, setTrancheB } = useData();

  const handleChange = (field, value) => {
    setTrancheB({
      ...trancheB,
      [field]: value,
    });
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Class B Tranche
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
        <TextField
          label="Maturity Days"
          type="number"
          value={trancheB.maturity_days}
          onChange={(e) => handleChange('maturity_days', parseInt(e.target.value) || 0)}
          sx={{ flex: '1 0 200px' }}
          InputProps={{
            inputProps: { min: 0 }
          }}
        />
        
        <TextField
          label="Base Rate (%)"
          type="number"
          value={trancheB.base_rate}
          onChange={(e) => handleChange('base_rate', parseFloat(e.target.value) || 0)}
          sx={{ flex: '1 0 200px' }}
          InputProps={{
            inputProps: { min: 0, step: 0.1 }
          }}
        />
        
        <TextField
          label="Spread (bps)"
          type="number"
          value={trancheB.spread}
          onChange={(e) => handleChange('spread', parseFloat(e.target.value) || 0)}
          sx={{ flex: '1 0 200px' }}
          InputProps={{
            inputProps: { min: 0, step: 0.1 }
          }}
        />
        
        <TextField
          label="Reinvest Rate (%)"
          type="number"
          value={trancheB.reinvest_rate}
          onChange={(e) => handleChange('reinvest_rate', parseFloat(e.target.value) || 0)}
          sx={{ flex: '1 0 200px' }}
          InputProps={{
            inputProps: { min: 0, step: 0.1 }
          }}
        />
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Class B nominal amount will be automatically calculated as 10.17811704% of total.
      </Typography>
    </Paper>
  );
};

export default TrancheBForm;