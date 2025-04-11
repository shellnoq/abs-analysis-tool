// frontend/src/pages/CalculationPage.js
import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  Button, 
  Alert,
  CircularProgress
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useData } from '../contexts/DataContext';
import { calculateResults } from '../services/apiService';
import GeneralSettingsForm from '../components/calculation/GeneralSettingsForm';
import TrancheAForm from '../components/calculation/TrancheAForm';
import TrancheBForm from '../components/calculation/TrancheBForm';
import CalculationResults from './CalculationResults';
import InterestRatesTable from '../components/calculation/InterestRatesTable';

const CalculationPage = () => {
  const { 
    cashFlowData,
    calculationResults, 
    setCalculationResults,
    isLoading,
    setIsLoading,
    error,
    setError,
    createCalculationRequest,
    previousCalculationResults
  } = useData();
  
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleCalculate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const request = createCalculationRequest();
      const results = await calculateResults(request);
      
      setCalculationResults(results);
      setTabValue(1); // Switch to results tab
      
      // Logging to ensure we have data for comparison
      console.log("Calculation results saved:", results);
      console.log("Previous results available:", previousCalculationResults ? "Yes" : "No");
    } catch (err) {
      setError('Calculation failed. Please check your parameters and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!cashFlowData) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Please upload cash flow data first
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        ABS Calculation
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Input Parameters" />
            <Tab label="Results" disabled={!calculationResults} />
            <Tab label="Interest Rates" disabled={!calculationResults} />
          </Tabs>
        </Box>
        
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <>
              <GeneralSettingsForm />
              <TrancheAForm />
              <TrancheBForm />
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleCalculate}
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={24} /> : <CalculateIcon />}
                >
                  {isLoading ? 'Calculating...' : 'Calculate Results'}
                </Button>
              </Box>
            </>
          )}
          
          {tabValue === 1 && calculationResults && (
            <CalculationResults results={calculationResults} />
          )}
          
          {tabValue === 2 && calculationResults && (
            <InterestRatesTable results={calculationResults} />
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CalculationPage;