// frontend/src/pages/CalculationPage.js
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  Button, 
  Alert,
  CircularProgress,
  Snackbar,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import CompareIcon from '@mui/icons-material/Compare';
import ReplayIcon from '@mui/icons-material/Replay';
import { useData } from '../contexts/DataContext';
import { calculateResults } from '../services/apiService';
import GeneralSettingsForm from '../components/calculation/GeneralSettingsForm';
import TrancheAForm from '../components/calculation/TrancheAForm';
import TrancheBForm from '../components/calculation/TrancheBForm';
import CalculationResults from './CalculationResults';
import InterestRatesTable from '../components/calculation/InterestRatesTable';
import { useNavigate } from 'react-router-dom';

const CalculationPage = () => {
  const navigate = useNavigate();
  const { 
    cashFlowData,
    calculationResults, 
    setCalculationResults,
    isLoading,
    setIsLoading,
    error,
    setError,
    createCalculationRequest,
    previousCalculationResults,
    resetToDefaults,
    multipleComparisonResults,
    setMultipleComparisonResults,
    shouldAutoCalculate,
    setShouldAutoCalculate
  } = useData();
  
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [optimizationData, setOptimizationData] = useState(null);
  
  // Auto-calculate when shouldAutoCalculate flag is true
  useEffect(() => {
    if (shouldAutoCalculate) {
      // Check for optimization data in sessionStorage
      const optimizationDataStr = sessionStorage.getItem('optimizationData');
      if (optimizationDataStr) {
        try {
          const optData = JSON.parse(optimizationDataStr);
          setOptimizationData(optData);
          // We'll use this data in handleCalculate
          sessionStorage.removeItem('optimizationData'); // Clear after reading
        } catch (e) {
          console.error("Error parsing optimization data", e);
        }
      }
      
      handleCalculate();
      setShouldAutoCalculate(false); // Reset the flag after processing
    }
  }, [shouldAutoCalculate, setShouldAutoCalculate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleCalculate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const request = createCalculationRequest();
      
      // Include optimization data if available
      if (optimizationData) {
        request.is_optimized = optimizationData.is_optimized;
        request.optimization_method = optimizationData.optimization_method;
      }
      
      const results = await calculateResults(request);
      
      // Add metadata for tracking and display
      if (!results.is_optimized) {
        // This is a manual calculation
        results.label = 'Manual Calculation';
        results.method_type = 'manual';
        results.timestamp = new Date().toISOString();
      } else {
        // For optimized calculations, use the optimization method name
        const methodDisplayNames = {
          'classic': 'Standard Optimization',
          'genetic': 'Evolutionary Algorithm',
          'equal': 'Equal Distribution',
          'increasing': 'Increasing by Maturity', 
          'decreasing': 'Decreasing by Maturity',
          'middle_weighted': 'Middle Weighted'
        };
        
        const methodName = results.optimization_method || 'Optimized';
        results.label = `${methodDisplayNames[methodName] || methodName} Optimization`;
        results.method_type = methodName === 'genetic' ? 'genetic' : 'standard';
        results.timestamp = new Date().toISOString();
      }
      
      setCalculationResults(results);
      setTabValue(1); // Switch to results tab
      
      // Add to comparison history if it's a new calculation
      if (!calculationResults || 
          JSON.stringify(results) !== JSON.stringify(calculationResults)) {
        
        setMultipleComparisonResults(prev => {
          // Create a new array to avoid reference issues
          const updatedResults = prev ? [...prev] : [];
          
          // Check if we already have a result of the same type
          const existingIndex = updatedResults.findIndex(r => 
            r.method_type === results.method_type
          );
          
          // If we have a result of this type, replace it
          if (existingIndex >= 0) {
            updatedResults[existingIndex] = { ...results };
          } else {
            // Otherwise add it to the array
            // Check if we've reached the maximum number of comparisons (limit to 5 for UI reasons)
            if (updatedResults.length >= 5) {
              updatedResults.shift(); // Remove the oldest result
            }
            updatedResults.push({ ...results });
          }
          
          console.log("Saving calculation to comparison results:", results.method_type);
          return updatedResults;
        });
      }
      
      // Show success message
      setSnackbarMessage('Calculation completed successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Logging to ensure we have data for comparison
      console.log("Calculation results saved:", results);
      console.log("Previous results available:", previousCalculationResults ? "Yes" : "No");
    } catch (err) {
      setError('Calculation failed. Please check your parameters and try again.');
      console.error(err);
      
      // Show error message
      setSnackbarMessage('Calculation failed. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
      // Reset optimization data after use
      setOptimizationData(null);
    }
  };
  
  // Reset to original default values
  const handleReset = () => {
    if (resetToDefaults()) {
      setSnackbarMessage('Reset to original values successfully.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage('Failed to reset to original values.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Navigate to comparison page
  const goToComparison = () => {
    navigate('/comparison');
  };
  
  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
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
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          ABS Calculation
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {calculationResults && previousCalculationResults && (
            <Button
              variant="outlined"
              color="primary"
              onClick={goToComparison}
              startIcon={<CompareIcon />}
            >
              View Comparisons
            </Button>
          )}
          
          <Tooltip title="Reset to original values">
            <IconButton 
              color="primary" 
              onClick={handleReset}
              size="small"
            >
              <ReplayIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
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
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
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
                
                {calculationResults && previousCalculationResults && (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={goToComparison}
                    startIcon={<CompareIcon />}
                  >
                    Compare Results
                  </Button>
                )}
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