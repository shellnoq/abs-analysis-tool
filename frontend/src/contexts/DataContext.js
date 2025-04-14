// src/contexts/DataContext.js

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
  
  // Merged state for saved comparison results and multiple comparison results
  const [savedResults, setSavedResults] = useState(() => {
    const saved = localStorage.getItem('savedResults');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [multipleComparisonResults, setMultipleComparisonResults] = useState(() => {
    const saved = localStorage.getItem('multipleComparisonResults');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Wrap setState functions to also update localStorage
  const setCalculationResultsWithStorage = (results) => {
    setCalculationResults(results);
    if (results) {
      localStorage.setItem('calculationResults', JSON.stringify(results));
    } else {
      localStorage.removeItem('calculationResults');
    }
  };
  
  const setOptimizationResultsWithStorage = (results) => {
    setOptimizationResults(results);
    if (results) {
      localStorage.setItem('optimizationResults', JSON.stringify(results));
    } else {
      localStorage.removeItem('optimizationResults');
    }
  };
  
  const setPreviousCalculationResultsWithStorage = (results) => {
    setPreviousCalculationResults(results);
    if (results) {
      localStorage.setItem('previousCalculationResults', JSON.stringify(results));
    } else {
      localStorage.removeItem('previousCalculationResults');
    }
  };
  
  const setSavedResultsWithStorage = (results) => {
    setSavedResults(results);
    if (results && results.length > 0) {
      localStorage.setItem('savedResults', JSON.stringify(results));
    } else {
      localStorage.removeItem('savedResults');
    }
  };
  
  const setMultipleComparisonResultsWithStorage = (results) => {
    // Ensure it's an array
    const updatedResults = Array.isArray(results) ? [...results] : [];
    setMultipleComparisonResults(updatedResults);
    localStorage.setItem('multipleComparisonResults', JSON.stringify(updatedResults));
    console.log("Updated multipleComparisonResults:", updatedResults);
  };
  
  // Function to save a result with a name
  const saveResult = (result, name, methodType) => {
    if (!result) return false;
    
    // Create a copy of the result with additional metadata
    const resultToSave = {
      ...result,
      id: Date.now().toString(),
      savedName: name,
      timestamp: new Date().toISOString(),
      methodType: methodType || result.method_type || 'manual'
    };
    
    // Add or update in savedResults array
    setSavedResultsWithStorage([...savedResults, resultToSave]);
    return true;
  };
  
  // Function to delete a saved result
  const deleteSavedResult = (resultId) => {
    const updatedResults = savedResults.filter(result => result.id !== resultId);
    setSavedResultsWithStorage(updatedResults);
  };
  
  // Clear all saved results
  const clearSavedResults = () => {
    setSavedResultsWithStorage([]);
  };
  
  // Clear comparison data function
  const clearComparisonData = () => {
    setMultipleComparisonResultsWithStorage([]);
    console.log("Comparison data cleared");
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
  
  // Optimization settings
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
    setCalculationResultsWithStorage(null);
    setOptimizationResultsWithStorage(null);
    setError(null);
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
    
    // Saved results for comparison (from first file)
    savedResults,
    setSavedResults: setSavedResultsWithStorage,
    saveResult,
    deleteSavedResult,
    clearSavedResults,
    
    // Multiple comparison results (from second file)
    multipleComparisonResults,
    setMultipleComparisonResults: setMultipleComparisonResultsWithStorage,
    clearComparisonData,
    
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