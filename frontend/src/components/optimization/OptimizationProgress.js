// src/components/optimization/OptimizationProgress.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress, 
  Paper, 
  Divider,
  Chip,
  Button,
  alpha,
  useTheme
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SpeedIcon from '@mui/icons-material/Speed';
import PendingIcon from '@mui/icons-material/Pending';
import SyncIcon from '@mui/icons-material/Sync';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const OptimizationProgress = ({ isOptimizing, onComplete }) => {
  const theme = useTheme();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('Initializing');
  const [message, setMessage] = useState('Starting optimization...');
  const [pollingActive, setPollingActive] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [stuckDetected, setStuckDetected] = useState(false);
  const [lastProgressUpdate, setLastProgressUpdate] = useState(Date.now());
  const [lastProgressValue, setLastProgressValue] = useState(0);
  
  // Start polling when optimization starts
  useEffect(() => {
    if (isOptimizing && !pollingActive) {
      setPollingActive(true);
      setProgress(0);
      setPhase('Initializing');
      setMessage('Starting optimization...');
      setPollCount(0);
      setStuckDetected(false);
      setLastProgressUpdate(Date.now());
      setLastProgressValue(0);
    } else if (!isOptimizing && pollingActive) {
      setPollingActive(false);
    }
  }, [isOptimizing, pollingActive]);
  
  // Handle refresh button click
  const handleRefresh = () => {
    if (stuckDetected) {
      setStuckDetected(false);
      setPollCount(0);
      setLastProgressUpdate(Date.now());
    }
  };
  
  // Polling effect
  useEffect(() => {
    let intervalId;
    
    if (pollingActive) {
      // Poll every second
      intervalId = setInterval(async () => {
        try {
          const response = await axios.get(`${API_URL}/optimize/progress/`);
          const data = response.data;
          
          // Check if progress has changed or message has changed
          const hasProgressChanged = data.progress !== progress;
          const hasMessageChanged = data.message !== message;
          
          if (hasProgressChanged || hasMessageChanged) {
            setProgress(data.progress);
            setPhase(data.phase);
            setMessage(data.message);
            setLastProgressUpdate(Date.now());
            
            if (hasProgressChanged) {
              setLastProgressValue(data.progress);
            }
          } else {
            // If no progress update, increment counter
            setPollCount(prev => prev + 1);
          }
          
          // Check for stuck progress - if no change for 30 seconds
          const timeSinceUpdate = Date.now() - lastProgressUpdate;
          if (pollCount > 30 && timeSinceUpdate > 30000) {
            setStuckDetected(true);
          }
          
          // If progress is 100%, notify parent component
          if (data.progress >= 100) {
            setPollingActive(false);
            if (onComplete) {
              onComplete();
            }
          }
        } catch (error) {
          console.error('Error fetching optimization progress:', error);
          setPollCount(prev => prev + 1);
          
          // If we've had many errors, consider it stuck
          if (pollCount > 15) {
            setStuckDetected(true);
          }
        }
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [pollingActive, onComplete, progress, message, pollCount, lastProgressUpdate, lastProgressValue]);
  
  // Auto-complete if we've been at 100% for a while
  useEffect(() => {
    if (progress >= 100 && pollingActive) {
      const timeoutId = setTimeout(() => {
        setPollingActive(false);
        if (onComplete) {
          onComplete();
        }
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [progress, pollingActive, onComplete]);
  
  if (!isOptimizing && progress === 0) {
    return null;
  }
  
  // Calculate progress color
  const getProgressColor = () => {
    if (stuckDetected) return theme.palette.error.main;
    if (progress < 30) return theme.palette.info.main;
    if (progress < 70) return theme.palette.primary.main;
    return theme.palette.success.main;
  };
  
  // Progress icon
  const getProgressIcon = () => {
    if (stuckDetected) return <SyncIcon color="error" />;
    if (progress < 50) return <PendingIcon color="primary" />;
    return <SpeedIcon color="success" />;
  };
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 2,
        border: stuckDetected 
          ? `1px solid ${alpha(theme.palette.error.main, 0.3)}`
          : `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        backgroundColor: stuckDetected
          ? alpha(theme.palette.error.main, 0.05)
          : alpha(theme.palette.primary.main, 0.03)
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getProgressIcon()}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {stuckDetected ? 'Optimization Progress (Stuck)' : 'Optimization Progress'}
            </Typography>
          </Box>
          <Chip 
            label={phase} 
            color={stuckDetected ? "error" : "primary"} 
            variant="outlined"
            size="small"
          />
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 10, 
            borderRadius: 5,
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              backgroundColor: getProgressColor()
            }
          }} 
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {progress}%
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {stuckDetected 
            ? "Optimization might be stuck. The server is still processing, but progress updates have stopped." 
            : progress === 100 
              ? "Optimization completed successfully." 
              : "Please wait while the optimization is in progress..."}
        </Typography>
        
        {stuckDetected && (
          <Button 
            variant="outlined" 
            color="error" 
            size="small" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ ml: 2 }}
          >
            Refresh
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default OptimizationProgress;