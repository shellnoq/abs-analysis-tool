// src/components/optimization/OptimizationSettingsForm.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Slider, 
  TextField, 
  InputAdornment,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  IconButton,
  alpha,
  useTheme,
  Divider,
  Grid,
  Card,
  CardContent,
  Switch,
  FormGroup,
  Checkbox
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import TuneIcon from '@mui/icons-material/Tune';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BalanceIcon from '@mui/icons-material/Balance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import SpeedIcon from '@mui/icons-material/Speed';

const OptimizationSettingsForm = ({ values, onChange }) => {
  const theme = useTheme();
  const [optimizationMethod, setOptimizationMethod] = useState(values.optimization_method || 'classic');
  const [selectedStrategies, setSelectedStrategies] = useState(values.selected_strategies || ['equal', 'increasing', 'decreasing', 'middle_weighted']);

  useEffect(() => {
    // Initialize selected strategies from props if available
    if (values.selected_strategies && values.selected_strategies.length > 0) {
      setSelectedStrategies(values.selected_strategies);
    }
  }, [values.selected_strategies]);

  const handleOptimizationMethodChange = (event) => {
    const newMethod = event.target.value;
    setOptimizationMethod(newMethod);
    onChange({ 
      ...values, 
      optimization_method: newMethod 
    });
  };

  const handleStrategiesChange = (event, newStrategies) => {
    // Ensure at least one strategy is selected
    if (newStrategies.length === 0) return;
    
    setSelectedStrategies(newStrategies);
    onChange({ 
      ...values, 
      selected_strategies: newStrategies 
    });
  };

  const handleSliderChange = (field) => (event, newValue) => {
    onChange({ ...values, [field]: newValue });
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'number' 
      ? parseFloat(event.target.value) 
      : event.target.value;
    onChange({ ...values, [field]: value });
  };

  // Method info details
  const methodInfo = {
    classic: {
      title: "Standard Optimization Strategies",
      icon: <TuneIcon sx={{ fontSize: 36, color: theme.palette.primary.main }} />,
      description: "Apply one or more traditional distribution strategies to optimize your tranche structure",
      color: theme.palette.primary.main
    },
    genetic: {
      title: "Evolutionary Algorithm",
      icon: <AccountTreeIcon sx={{ fontSize: 36, color: theme.palette.warning.main }} />,
      description: "Uses advanced genetic algorithms to intelligently search for optimal structures",
      color: theme.palette.warning.main
    }
  };

  // Strategy info
  const strategyInfo = {
    equal: {
      title: "Equal Distribution",
      icon: <BalanceIcon />,
      description: "Allocates equal nominal amounts across all tranches",
      color: theme.palette.primary.main
    },
    increasing: {
      title: "Increasing by Maturity",
      icon: <TrendingUpIcon />,
      description: "Higher allocations for longer maturity tranches",
      color: theme.palette.success.main
    },
    decreasing: {
      title: "Decreasing by Maturity",
      icon: <TrendingDownIcon />,
      description: "Higher allocations for shorter maturity tranches",
      color: theme.palette.error.main
    },
    middle_weighted: {
      title: "Middle-Weighted",
      icon: <EqualizerIcon />,
      description: "Higher allocations for middle maturity tranches",
      color: theme.palette.info.main
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{ mb: 3 }}>
        Select an optimization method and configure parameters to find the optimal structure for your asset-backed securities
      </Typography>
      
      {/* Method Selection */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Object.keys(methodInfo).map((method) => (
          <Grid item xs={12} sm={6} key={method}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 2,
                border: `1px solid ${optimizationMethod === method 
                  ? alpha(methodInfo[method].color, 0.5) 
                  : alpha(theme.palette.text.primary, 0.08)}`,
                backgroundColor: optimizationMethod === method 
                  ? alpha(methodInfo[method].color, 0.05)
                  : 'background.paper',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                height: '100%',
                '&:hover': {
                  borderColor: alpha(methodInfo[method].color, 0.5),
                  backgroundColor: alpha(methodInfo[method].color, 0.03)
                }
              }}
              onClick={() => {
                setOptimizationMethod(method);
                onChange({ ...values, optimization_method: method });
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <FormControlLabel
                  value={method}
                  control={
                    <Radio 
                      checked={optimizationMethod === method}
                      onChange={() => {}}
                      color={optimizationMethod === method ? undefined : "default"}
                    />
                  }
                  label={
                    <Box sx={{ ml: 0.5 }}>
                      {methodInfo[method].icon}
                      <Typography variant="subtitle1" sx={{ mt: 1.5, fontWeight: 500 }}>
                        {methodInfo[method].title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, minHeight: 60 }}>
                        {methodInfo[method].description}
                      </Typography>
                    </Box>
                  }
                  sx={{ mx: 0, alignItems: 'flex-start', '& .MuiFormControlLabel-label': { width: '100%' } }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Strategy Selection for Classic Method */}
      {optimizationMethod === 'classic' && (
        <Box sx={{ mb: 4, p: 3, backgroundColor: alpha(theme.palette.primary.light, 0.05), borderRadius: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
          <Typography variant="h6" gutterBottom color="primary.main" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TuneIcon sx={{ mr: 1 }} /> Select Optimization Strategies
            <Tooltip title="Select one or more strategies to include in the optimization process. The system will determine which strategy produces the best results." sx={{ ml: 1 }}>
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select the strategies you want to include in the optimization process. The system will evaluate all selected strategies and identify the one that produces the best results.
          </Typography>
          
          <Grid container spacing={2}>
            {Object.keys(strategyInfo).map((strategy) => (
              <Grid item xs={12} sm={6} md={3} key={strategy}>
                <Paper 
                  elevation={0}
                  sx={{
                    p: 2,
                    border: `1px solid ${selectedStrategies.includes(strategy) 
                      ? alpha(strategyInfo[strategy].color, 0.5) 
                      : alpha(theme.palette.text.primary, 0.1)}`,
                    backgroundColor: selectedStrategies.includes(strategy) 
                      ? alpha(strategyInfo[strategy].color, 0.1)
                      : 'transparent',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    '&:hover': {
                      borderColor: alpha(strategyInfo[strategy].color, 0.7),
                      backgroundColor: alpha(strategyInfo[strategy].color, 0.05)
                    }
                  }}
                  onClick={() => {
                    const newSelection = selectedStrategies.includes(strategy)
                      ? selectedStrategies.filter(s => s !== strategy)
                      : [...selectedStrategies, strategy];
                    
                    if (newSelection.length > 0) {
                      handleStrategiesChange(null, newSelection);
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Checkbox 
                      checked={selectedStrategies.includes(strategy)}
                      size="small"
                      sx={{ p: 0.5, mr: 1 }}
                      color={selectedStrategies.includes(strategy) ? undefined : "default"}
                    />
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      color: selectedStrategies.includes(strategy) 
                        ? strategyInfo[strategy].color 
                        : 'text.primary'
                    }}>
                      {React.cloneElement(strategyInfo[strategy].icon, { 
                        sx: { 
                          mr: 1,
                          color: selectedStrategies.includes(strategy) 
                            ? strategyInfo[strategy].color 
                            : 'text.secondary'
                        } 
                      })}
                      <Typography variant="subtitle2" fontWeight={500}>
                        {strategyInfo[strategy].title}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.8rem' }}>
                    {strategyInfo[strategy].description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.7), p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom color={methodInfo[optimizationMethod].color}>
          {methodInfo[optimizationMethod].title} Configuration
        </Typography>
        
        {/* Method-specific settings */}
        {optimizationMethod === 'classic' && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="medium">
              Standard Optimization Settings
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 4 }}>
              <FormLabel>Class A Tranches Range</FormLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography>{values.a_tranches_range[0]}</Typography>
                <Slider
                  value={values.a_tranches_range}
                  onChange={handleSliderChange('a_tranches_range')}
                  min={1}
                  max={10}
                  step={1}
                  valueLabelDisplay="auto"
                  aria-labelledby="a-tranches-range-slider"
                  sx={{ mx: 2 }}
                />
                <Typography>{values.a_tranches_range[1]}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Number of Class A tranches to consider in optimization
              </Typography>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 4 }}>
              <FormLabel>Maturity Range (days)</FormLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography>{values.maturity_range[0]}</Typography>
                <Slider
                  value={values.maturity_range}
                  onChange={handleSliderChange('maturity_range')}
                  min={30}
                  max={365}
                  step={5}
                  valueLabelDisplay="auto"
                  aria-labelledby="maturity-range-slider"
                  sx={{ mx: 2 }}
                />
                <Typography>{values.maturity_range[1]}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Range of maturity periods to consider in days
              </Typography>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 4 }}>
              <FormLabel>Maturity Step</FormLabel>
              <Slider
                value={values.maturity_step}
                onChange={handleSliderChange('maturity_step')}
                min={5}
                max={30}
                step={5}
                valueLabelDisplay="auto"
                aria-labelledby="maturity-step-slider"
                marks={[
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                  { value: 15, label: '15' },
                  { value: 20, label: '20' },
                  { value: 25, label: '25' },
                  { value: 30, label: '30' },
                ]}
              />
              <Typography variant="body2" color="text.secondary">
                Step size between maturity values
              </Typography>
            </FormControl>
          </Box>
        )}
        
        {optimizationMethod === 'genetic' && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="medium">
              Evolutionary Algorithm Settings
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <FormLabel>Population Size</FormLabel>
              <Slider
                value={values.population_size || 50}
                onChange={(e, newValue) => onChange({ ...values, population_size: newValue })}
                min={10}
                max={100}
                step={5}
                valueLabelDisplay="auto"
                marks={[
                  { value: 10, label: '10' },
                  { value: 50, label: '50' },
                  { value: 100, label: '100' },
                ]}
              />
              <Typography variant="body2" color="text.secondary">
                Number of individuals in each generation - larger populations can find better solutions but take longer
              </Typography>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 4 }}>
              <FormLabel>Number of Generations</FormLabel>
              <Slider
                value={values.num_generations || 40}
                onChange={(e, newValue) => onChange({ ...values, num_generations: newValue })}
                min={10}
                max={100}
                step={5}
                valueLabelDisplay="auto"
                marks={[
                  { value: 10, label: '10' },
                  { value: 40, label: '40' },
                  { value: 100, label: '100' },
                ]}
              />
              <Typography variant="body2" color="text.secondary">
                Number of evolutionary cycles to run - more generations improve results but take longer
              </Typography>
            </FormControl>
          </Box>
        )}
        
        <Divider sx={{ my: 3 }} />
        
        {/* Common settings for all optimization methods */}
        <Typography variant="subtitle2" gutterBottom fontWeight="medium">
          Common Optimization Parameters
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <FormLabel>Minimum Class B Percentage</FormLabel>
              <TextField
                value={values.min_class_b_percent}
                onChange={handleInputChange('min_class_b_percent')}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { min: 5, max: 30, step: 0.5 }
                }}
                margin="normal"
              />
              <Typography variant="body2" color="text.secondary">
                Minimum percentage of total nominal to allocate to Class B
              </Typography>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <FormLabel>Target Class B Coupon Rate</FormLabel>
              <TextField
                value={values.target_class_b_coupon_rate}
                onChange={handleInputChange('target_class_b_coupon_rate')}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { min: 10, max: 100, step: 0.5 }
                }}
                margin="normal"
              />
              <Typography variant="body2" color="text.secondary">
                Target annual coupon rate for Class B tranche
              </Typography>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <FormLabel>Additional Days for Class B</FormLabel>
              <TextField
                value={values.additional_days_for_class_b}
                onChange={handleInputChange('additional_days_for_class_b')}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">days</InputAdornment>,
                  inputProps: { min: 1, max: 180, step: 1 }
                }}
                margin="normal"
              />
              <Typography variant="body2" color="text.secondary">
                Additional days to add to the last cash flow date for Class B maturity
              </Typography>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default OptimizationSettingsForm;