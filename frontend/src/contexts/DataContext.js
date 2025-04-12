// frontend/src/contexts/DataContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  // File upload and data state
  const [cashFlowData, setCashFlowData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Calculation form state
  const [generalSettings, setGeneralSettings] = useState({
    start_date: new Date(2025, 1, 13),
    operational_expenses: 7928640,
    min_buffer: 5.0
  });
  
  const [tranchesA, setTranchesA] = useState([
    { maturity_days: 61, base_rate: 45.6, spread: 0.0, reinvest_rate: 40.0, nominal: 480000000 },
    { maturity_days: 120, base_rate: 44.5, spread: 0.0, reinvest_rate: 37.25, nominal: 460000000 },
    { maturity_days: 182, base_rate: 43.3, spread: 0.0, reinvest_rate: 32.5, nominal: 425000000 },
    { maturity_days: 274, base_rate: 42.5, spread: 0.0, reinvest_rate: 30.0, nominal: 400000000 },
  ]);
  
  // Store original tranche values for reset functionality
  const [originalTranchesA, setOriginalTranchesA] = useState(null);
  const [originalTrancheB, setOriginalTrancheB] = useState(null);
  
  const [trancheB, setTrancheB] = useState({
    maturity_days: 300,
    base_rate: 0.0,
    spread: 0.0,
    reinvest_rate: 25.5
  });
  
  const [npvSettings, setNpvSettings] = useState({
    method: 'weighted_avg_rate',
    custom_rate: 40.0
  });
  
  // Flag for auto-calculating when navigating from optimization page
  const [shouldAutoCalculate, setShouldAutoCalculate] = useState(false);
  
  // Results state with localStorage initialization
  const [calculationResults, setCalculationResults] = useState(() => {
    const saved = localStorage.getItem('calculationResults');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [optimizationResults, setOptimizationResults] = useState(() => {
    const saved = localStorage.getItem('optimizationResults');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [previousCalculationResults, setPreviousCalculationResults] = useState(() => {
    const saved = localStorage.getItem('previousCalculationResults');
    return saved ? JSON.parse(saved) : null;
  });
  
  // New state for multiple comparison results
  const [multipleComparisonResults, setMultipleComparisonResults] = useState(() => {
    const saved = localStorage.getItem('multipleComparisonResults');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Wrap setState functions to also update localStorage
  const setCalculationResultsWithStorage = (results) => {
    setCalculationResults(results);
    localStorage.setItem('calculationResults', JSON.stringify(results));
  };
  
  const setOptimizationResultsWithStorage = (results) => {
    setOptimizationResults(results);
    localStorage.setItem('optimizationResults', JSON.stringify(results));
  };
  
  const setPreviousCalculationResultsWithStorage = (results) => {
    setPreviousCalculationResults(results);
    localStorage.setItem('previousCalculationResults', JSON.stringify(results));
  };
  
  const setMultipleComparisonResultsWithStorage = (results) => {
    setMultipleComparisonResults(results);
    localStorage.setItem('multipleComparisonResults', JSON.stringify(results));
  };
  
  // Store original values when first loading
  useEffect(() => {
    if (!originalTranchesA) {
      setOriginalTranchesA(JSON.parse(JSON.stringify(tranchesA)));
    }
    if (!originalTrancheB) {
      setOriginalTrancheB(JSON.parse(JSON.stringify(trancheB)));
    }
  }, []);
  
  // Update localStorage when state changes
  useEffect(() => {
    if (calculationResults) {
      localStorage.setItem('calculationResults', JSON.stringify(calculationResults));
    }
  }, [calculationResults]);
  
  useEffect(() => {
    if (optimizationResults) {
      localStorage.setItem('optimizationResults', JSON.stringify(optimizationResults));
    }
  }, [optimizationResults]);
  
  useEffect(() => {
    if (previousCalculationResults) {
      localStorage.setItem('previousCalculationResults', JSON.stringify(previousCalculationResults));
    }
  }, [previousCalculationResults]);
  
  useEffect(() => {
    if (multipleComparisonResults) {
      localStorage.setItem('multipleComparisonResults', JSON.stringify(multipleComparisonResults));
    }
  }, [multipleComparisonResults]);
  
  // Optimization settings - Updated with new method options
  const [optimizationSettings, setOptimizationSettings] = useState({
    optimization_method: 'classic', // Default to classic
    a_tranches_range: [2, 6],
    maturity_range: [32, 365],
    maturity_step: 10,
    min_class_b_percent: 10.0,
    target_class_b_coupon_rate: 30.0,
    additional_days_for_class_b: 10,
    // Genetic algorithm settings
    population_size: 50,
    num_generations: 40
    // Removed Gradient descent and Bayesian options
  });

  // Helper function to reset to default values
  const resetToDefaults = () => {
    if (originalTranchesA && originalTrancheB) {
      setTranchesA(JSON.parse(JSON.stringify(originalTranchesA)));
      setTrancheB(JSON.parse(JSON.stringify(originalTrancheB)));
      return true;
    }
    return false;
  };

  // Helper function to clear data
  const clearData = () => {
    setCashFlowData(null);
    setCalculationResultsWithStorage(null); // Use wrapper
    setOptimizationResultsWithStorage(null); // Use wrapper
    setError(null);
    
    // Also clear from localStorage
    localStorage.removeItem('calculationResults');
    localStorage.removeItem('optimizationResults');
  };

  // Create calculation request payload
  const createCalculationRequest = () => {
    return {
      general_settings: {
        start_date: generalSettings.start_date.toISOString().split('T')[0],
        operational_expenses: generalSettings.operational_expenses,
        min_buffer: generalSettings.min_buffer
      },
      tranches_a: tranchesA,
      tranche_b: trancheB,
      npv_settings: npvSettings
      // Optimization data will be added in CalculationPage component
    };
  };

  // Create optimization request payload
  const createOptimizationRequest = () => {
    return {
      optimization_settings: optimizationSettings,
      general_settings: {
        start_date: generalSettings.start_date.toISOString().split('T')[0],
        operational_expenses: generalSettings.operational_expenses,
        min_buffer: generalSettings.min_buffer
      }
    };
  };

  const value = {
    // Data state
    cashFlowData,
    setCashFlowData,
    isLoading,
    setIsLoading,
    error,
    setError,
    
    // Form state
    generalSettings,
    setGeneralSettings,
    tranchesA,
    setTranchesA,
    trancheB,
    setTrancheB,
    npvSettings,
    setNpvSettings,
    
    // Auto-calculate flag
    shouldAutoCalculate,
    setShouldAutoCalculate,
    
    // Original values for reset
    originalTranchesA,
    originalTrancheB,
    
    // Results state - use wrapper functions instead of direct setState
    calculationResults,
    setCalculationResults: setCalculationResultsWithStorage,
    optimizationResults,
    setOptimizationResults: setOptimizationResultsWithStorage,
    previousCalculationResults,
    setPreviousCalculationResults: setPreviousCalculationResultsWithStorage,
    
    // Multiple comparison results
    multipleComparisonResults,
    setMultipleComparisonResults: setMultipleComparisonResultsWithStorage,
    
    // Optimization settings
    optimizationSettings,
    setOptimizationSettings,
    
    // Helper functions
    clearData,
    createCalculationRequest,
    createOptimizationRequest,
    resetToDefaults
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};