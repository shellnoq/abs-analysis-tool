// frontend/src/pages/OptimizationPage.js
import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Paper, Button, Alert, CircularProgress,
  Grid, Divider, alpha, Chip, Stepper, Step, StepLabel, useTheme
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import OptimizationSettingsForm from '../components/optimization/OptimizationSettingsForm';
import OptimizationResults from '../components/optimization/OptimizationResults';
import OptimizationProgress from '../components/optimization/OptimizationProgress';
import { useData } from '../contexts/DataContext';
import { optimizeStructure } from '../services/apiService';

const OptimizationPage = () => {
  const theme = useTheme();
  const { 
    cashFlowData, 
    optimizationResults, 
    setOptimizationResults, 
    isLoading, 
    setIsLoading, 
    error, 
    setError,
    optimizationSettings,
    setOptimizationSettings,
    generalSettings
  } = useData();
  
  // Additional state to control progress component
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Method translation mapping
  const getOptimizationMethodName = (method) => {
    const methods = {
      'classic': 'Standard Optimization',
      'genetic': 'Evolutionary Algorithm'
    };
    return methods[method] || method;
  };
  
  const handleFormChange = (values) => {
    setOptimizationSettings(values);
  };

  const handleOptimize = async () => {
    if (!cashFlowData) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setIsOptimizing(true); // Start progress tracking
      setOptimizationResults(null); // Clear previous results
      setActiveStep(1); // Move to progress step
      
      // Selected optimization method
      const method = optimizationSettings.optimization_method;
      console.log(`Starting ${method} optimization...`);
      
      // Prepare request parameters
      const params = {
        optimization_settings: optimizationSettings,
        general_settings: {
          start_date: generalSettings.start_date.toISOString().split('T')[0],
          operational_expenses: generalSettings.operational_expenses,
          min_buffer: generalSettings.min_buffer
        }
      };
      
      // Log the selected strategies
      if (method === 'classic' && optimizationSettings.selected_strategies) {
        console.log(`Selected strategies: ${optimizationSettings.selected_strategies.join(', ')}`);
      }
      
      // API call based on method
      try {
        const results = await optimizeStructure(params, method);
        console.log("Optimization successful:", results);
        setOptimizationResults(results);
        setActiveStep(2); // Move to results step
      } catch (optimizeError) {
        console.error("Optimization error details:", optimizeError);
        throw new Error(`Optimization failed: ${optimizeError.message}`);
      }
    } catch (error) {
      setError('Optimization failed. Please check your parameters and try again. Error: ' + error.message);
      console.error('Optimization error:', error);
      setIsOptimizing(false); // Make sure to stop progress tracking on error
      setActiveStep(0); // Return to settings step
    } finally {
      setIsLoading(false);
      // Keep isOptimizing true until the progress component handles the completion
    }
  };
  
  // Handle optimization completion
  const handleOptimizationComplete = () => {
    setIsOptimizing(false);
  };

  // New function to handle reset
  const handleReset = () => {
    setOptimizationResults(null);
    setIsOptimizing(false);
    setActiveStep(0);
    setError(null);
    
    // Optional: Reset to default settings
    // setOptimizationSettings({...default settings});
    
    window.scrollTo(0, 0); // Scroll to top for better UX
  };

  // Effect to update active step based on results
  useEffect(() => {
    if (optimizationResults && !isOptimizing) {
      setActiveStep(2);
    }
  }, [optimizationResults, isOptimizing]);

  if (!cashFlowData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
            backgroundColor: alpha(theme.palette.warning.main, 0.05),
          }}
        >
          <Box sx={{ 
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.warning.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <SpeedIcon sx={{ fontSize: 32, color: theme.palette.warning.main }} />
          </Box>
          <Typography variant="h5" color="warning.main" gutterBottom>
            Cash Flow Data Required
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please upload your cash flow data on the Home page before starting the optimization process.
          </Typography>
          <Button 
            variant="outlined" 
            color="warning" 
            href="/"
            sx={{ mt: 3 }}
          >
            Go to Home Page
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.07)} 100%)`,
          border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ fontSize: 28, color: theme.palette.secondary.main, mr: 1.5 }} />
            <Typography variant="h4" component="h1" fontWeight="500">
              ABS Structure Optimization
            </Typography>
          </Box>
          
          {/* "Start Over" button */}
          {(activeStep > 0 || optimizationResults) && (
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              disabled={isLoading || isOptimizing}
              sx={{ fontWeight: 500 }}
            >
              Start Over
            </Button>
          )}
        </Box>
        <Typography variant="body1" color="text.secondary">
          Optimize your asset-backed securities structure to maximize principal while maintaining buffer requirements.
          Choose an optimization method and parameters to find the optimal configuration for your tranches.
        </Typography>
      </Paper>
  
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            '& .MuiAlert-icon': {
              alignItems: 'center'
            }
          }}
        >
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          <Step>
            <StepLabel StepIconProps={{
              sx: { '& .MuiStepIcon-text': { fontWeight: 'bold' } }
            }}>
              Configure Settings
            </StepLabel>
          </Step>
          <Step>
            <StepLabel StepIconProps={{
              sx: { '& .MuiStepIcon-text': { fontWeight: 'bold' } }
            }}>
              Run Optimization
            </StepLabel>
          </Step>
          <Step>
            <StepLabel StepIconProps={{
              sx: { '& .MuiStepIcon-text': { fontWeight: 'bold' } }
            }}>
              Review Results
            </StepLabel>
          </Step>
        </Stepper>
      </Box>
      
      {/* Progress Component - will only show when optimization is running */}
      {isOptimizing && (
        <OptimizationProgress 
          isOptimizing={isOptimizing} 
          onComplete={handleOptimizationComplete} 
        />
      )}
      
      {(activeStep === 0 || (!isOptimizing && !optimizationResults)) && (
        <Paper 
          elevation={0}
          sx={{ 
            p: 0, 
            mb: 4, 
            overflow: 'hidden',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
            backgroundColor: 'background.paper'
          }}
        >
          <Box sx={{ 
            px: 3, 
            py: 2, 
            display: 'flex', 
            alignItems: 'center',
            borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.02)
          }}>
            <SettingsIcon sx={{ color: theme.palette.text.secondary, mr: 1.5 }} />
            <Typography variant="h6" fontWeight="medium">
              Optimization Settings
            </Typography>
            
            <Chip 
              label={getOptimizationMethodName(optimizationSettings.optimization_method)} 
              color="primary"
              variant="outlined"
              size="small"
              sx={{ ml: 'auto' }}
            />
          </Box>
          
          <Box sx={{ p: 3 }}>
            <OptimizationSettingsForm 
              values={optimizationSettings} 
              onChange={handleFormChange} 
            />
          </Box>
          
          <Divider />
          
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleOptimize}
              disabled={isLoading || isOptimizing}
              startIcon={isLoading || isOptimizing ? <CircularProgress size={20} /> : <PlayArrowIcon />}
              sx={{
                py: 1.2,
                px: 4,
                borderRadius: 2,
                fontWeight: 500
              }}
            >
              {isLoading || isOptimizing ? 'Optimizing...' : 'Run Optimization'}
            </Button>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This process may take several minutes depending on the complexity of your data and optimization settings.
            </Typography>
          </Box>
        </Paper>
      )}
      
      {optimizationResults && !isOptimizing && (
        <OptimizationResults results={optimizationResults} />
      )}
    </Container>
  );
};

export default OptimizationPage;