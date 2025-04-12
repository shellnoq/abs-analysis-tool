// src/components/optimization/OptimizationSettingsForm.js
import React, { useState } from 'react';
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
  Tooltip,
  IconButton,
  Divider,
  Grid,
  Card,
  CardContent,
  alpha,
  useTheme
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SpeedIcon from '@mui/icons-material/Speed';
import TuneIcon from '@mui/icons-material/Tune';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

const OptimizationSettingsForm = ({ values, onChange }) => {
  const theme = useTheme();
  const [optimizationMethod, setOptimizationMethod] = useState(values.optimization_method || 'classic');

  const handleOptimizationMethodChange = (event) => {
    setOptimizationMethod(event.target.value);
    onChange({ ...values, optimization_method: event.target.value });
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

  // Method info details - only for Classic and Genetic
  const methodInfo = {
    classic: {
      title: "Classic Strategies",
      icon: <TuneIcon sx={{ fontSize: 36, color: theme.palette.primary.main }} />,
      description: "Compares Equal, Increasing, Decreasing, and Middle-Weighted distribution strategies",
      color: theme.palette.primary.main
    },
    genetic: {
      title: "Genetic Algorithm",
      icon: <AccountTreeIcon sx={{ fontSize: 36, color: theme.palette.warning.main }} />,
      description: "Effective in large solution spaces with evolutionary search",
      color: theme.palette.warning.main
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{ mb: 3 }}>
        Select an optimization method and configure parameters to find the optimal tranche structure
      </Typography>
      
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

      <Divider sx={{ my: 4 }} />
      
      <Box sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.7), p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom color={methodInfo[optimizationMethod].color}>
          {methodInfo[optimizationMethod].title} Configuration
        </Typography>
        
        {/* Method-specific settings */}
        {optimizationMethod === 'classic' && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="medium">
              Classic Optimization Settings
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
              Genetic Algorithm Settings
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
              />
              <Typography variant="body2" color="text.secondary">
                Number of individuals in each generation
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
              />
              <Typography variant="body2" color="text.secondary">
                Number of evolutionary cycles to run
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