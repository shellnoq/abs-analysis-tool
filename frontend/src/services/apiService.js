// frontend/src/services/apiService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout for optimization requests
});

// File upload needs different content type
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    console.log('Uploading file:', file.name);
    const response = await axios.post(`${API_URL}/upload-excel/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('File upload successful');
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

const calculateResults = async (params) => {
  try {
    console.log('Calculating results with params:', params);
    const response = await apiClient.post('/calculate/', params);
    console.log('Calculation successful');
    return response.data;
  } catch (error) {
    console.error('Error calculating results:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

const optimizeStructure = async (params, method = 'classic') => {
  try {
    console.log(`Starting optimization with method: ${method}`);
    console.log('Optimization params:', JSON.stringify(params, null, 2));
    
    // Create a cancelable request for optimization
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    
    // Set up timeout to cancel if it takes too long
    const timeout = setTimeout(() => {
      source.cancel('Operation timeout: The optimization process took too long');
    }, 300000); // 5 minute timeout
    
    const response = await apiClient.post(`/optimize/${method}/`, params, {
      cancelToken: source.token
    });
    
    // Clear timeout
    clearTimeout(timeout);
    
    console.log(`${method} optimization completed successfully`);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} optimization:`, error);
    
    // Check if error was caused by cancellation
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
      throw new Error('Optimization process was canceled: ' + error.message);
    }
    
    // Log detailed response info if available
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      const status = error.response.status;
      let message = 'Optimization failed';
      
      switch (status) {
        case 400:
          message = 'Invalid optimization parameters: ' + (error.response.data.detail || 'Please check your parameters');
          break;
        case 500:
          message = 'Server error during optimization. The calculation may be too complex.';
          break;
        case 504:
          message = 'Optimization timed out. Try again with simpler parameters.';
          break;
        default:
          message = `Optimization error (${status}): ` + (error.response.data.detail || error.message);
      }
      
      throw new Error(message);
    }
    
    throw error;
  }
};

// Add a progress polling function
const pollOptimizationProgress = async () => {
  try {
    const response = await apiClient.get('/optimize/progress/');
    return response.data;
  } catch (error) {
    console.error('Error polling optimization progress:', error);
    return {
      progress: 0,
      phase: 'Error',
      message: 'Failed to get progress information',
      error: true
    };
  }
};

export { uploadFile, calculateResults, optimizeStructure, pollOptimizationProgress };