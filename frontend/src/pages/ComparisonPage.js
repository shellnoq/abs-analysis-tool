// src/pages/ComparisonPage.js
import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  Grid, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Divider,
  alpha,
  useTheme,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Select,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import { useData } from '../contexts/DataContext';
import CompareIcon from '@mui/icons-material/Compare';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Area, AreaChart, ScatterChart, Scatter, ZAxis, ReferenceLine
} from "recharts";

const ComparisonPage = () => {
  const theme = useTheme();
  const { 
    calculationResults, 
    previousCalculationResults, 
    multipleComparisonResults,
    setMultipleComparisonResults
  } = useData();
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedResults, setSelectedResults] = useState(['current', 'previous']);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle menu open/close
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle clear all results
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all comparison results?')) {
      setMultipleComparisonResults([]);
      handleMenuClose();
    }
  };
  
  // Handle selection change
  const handleSelectionChange = (event, resultId) => {
    const selectedValue = event.target.value;
    
    if (selectedValue) {
      const newSelected = [...selectedResults];
      const index = newSelected.indexOf(resultId);
      
      if (index !== -1) {
        newSelected[index] = selectedValue;
        setSelectedResults(newSelected);
      }
    }
  };
  
  // Handle delete result
  const handleDeleteResult = (index) => {
    const newResults = [...multipleComparisonResults];
    newResults.splice(index, 1);
    setMultipleComparisonResults(newResults);
    
    // Update selected results if necessary
    const newSelected = selectedResults.map(sel => {
      if (sel.startsWith('multi-') && parseInt(sel.split('-')[1]) === index) {
        return 'current';
      } else if (sel.startsWith('multi-') && parseInt(sel.split('-')[1]) > index) {
        return `multi-${parseInt(sel.split('-')[1]) - 1}`;
      }
      return sel;
    });
    
    setSelectedResults(newSelected);
  };

  // Format currency values
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "₺0.00";
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value);
  };
  
  // Format percentage values
  const formatPercent = (value) => {
    if (value === undefined || value === null) return "0.00%";
    return `${value.toFixed(2)}%`;
  };

  // Calculate percentage difference
  const calculateDifference = (current, previous) => {
    if (!current || !previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  // Format difference with color and sign
  const formatDifference = (diff) => {
    if (diff === null) return "-";
    const isPositive = diff > 0;
    return (
      <Typography 
        variant="body2" 
        sx={{ 
          color: isPositive ? 'success.main' : 'error.main',
          fontWeight: 'medium',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {isPositive ? '+' : ''}{diff.toFixed(2)}%
      </Typography>
    );
  };
  
  // Get results by selection ID
  const getResultsById = (id) => {
    if (id === 'current') {
      return calculationResults;
    } else if (id === 'previous') {
      return previousCalculationResults;
    } else if (id.startsWith('multi-')) {
      const index = parseInt(id.split('-')[1]);
      return multipleComparisonResults[index];
    }
    return null;
  };
  
  // Check for any selection
  const hasValidSelection = () => {
    return selectedResults.some(id => getResultsById(id) !== null);
  };
  
  // Get comparison results
  const getComparisonResults = () => {
    return selectedResults.map(id => {
      const result = getResultsById(id);
      if (!result) return null;
      
      let label = '';
      if (id === 'current') {
        label = result.is_optimized 
          ? `Current (${result.optimization_method || 'Optimized'})` 
          : 'Current (Manual)';
      } else if (id === 'previous') {
        label = 'Previous';
      } else if (id.startsWith('multi-')) {
        const index = parseInt(id.split('-')[1]);
        label = multipleComparisonResults[index]?.label || `Result ${index + 1}`;
      }
      
      return {
        id,
        label,
        result,
        isOptimized: result.is_optimized,
        method: result.optimization_method,
        color: id === 'current' 
          ? theme.palette.primary.main 
          : id === 'previous'
            ? theme.palette.secondary.main
            : theme.palette.info.main
      };
    }).filter(item => item !== null);
  };

  // No comparison data available, show guidance
  if (!hasValidSelection()) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
          }}
        >
          <CompareIcon sx={{ fontSize: 60, color: theme.palette.info.main, opacity: 0.7, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Comparison Data Not Available
          </Typography>
          <Typography variant="body1" color="text.secondary">
            To compare results, first calculate your initial structure, then apply an optimization result and calculate again.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="primary" fontWeight="medium">
                      How to Compare
                    </Typography>
                    <ol>
                      <li>Go to the Calculation page and set up your initial parameters</li>
                      <li>Calculate the results for your manual configuration</li>
                      <li>Go to the Optimization page and run an optimization</li>
                      <li>Apply the optimized configuration and see the calculated results</li>
                      <li>Return to this page to see a detailed comparison</li>
                    </ol>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    );
  }
  
  // Get active comparison results
  const comparisonResults = getComparisonResults();
  
  // Prepare chart data
  const barChartData = comparisonResults.map(item => ({
    name: item.label,
    classA: item.result.class_a_total || 0,
    classB: item.result.class_b_total || 0,
    total: (item.result.class_a_total || 0) + (item.result.class_b_total || 0),
    color: item.color
  }));
  
  // Prepare principal interest breakdown data
  const breakdownData = comparisonResults.map(item => ({
    name: item.label,
    classAPrincipal: item.result.class_a_principal || 0,
    classAInterest: item.result.class_a_interest || 0,
    classBPrincipal: item.result.class_b_principal || 0,
    classBCoupon: item.result.class_b_coupon || 0,
    color: item.color
  }));
  
  // Prepare buffer data
  const bufferData = comparisonResults.map(item => ({
    name: item.label,
    minBuffer: item.result.min_buffer_actual || 0,
    color: item.color
  }));
  
  // Prepare financing data
  const financingData = comparisonResults.map(item => ({
    name: item.label,
    financingCost: Math.abs(item.result.financing_cost || 0),
    isProfit: (item.result.financing_cost || 0) > 0,
    principalPaid: item.result.total_principal_paid || 0,
    loanPrincipal: item.result.total_loan_principal || 0,
    color: item.color
  }));
  
  // Helper function for custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, borderRadius: 1, boxShadow: 2 }}>
          <Typography variant="body2" fontWeight="medium">{label}</Typography>
          {payload.map((entry, index) => (
            <Box key={`tooltip-${index}`} sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="body2" sx={{ mr: 2, color: entry.color }}>
                {entry.name}:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {entry.name.includes('Buffer') 
                  ? `${entry.value.toFixed(2)}%` 
                  : formatCurrency(entry.value)}
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };
  
  // Get all available results for selection dropdown
  const getAvailableResults = () => {
    const options = [];
    
    if (calculationResults) {
      options.push({ id: 'current', label: calculationResults.is_optimized 
        ? `Current (${calculationResults.optimization_method || 'Optimized'})` 
        : 'Current (Manual)' });
    }
    
    if (previousCalculationResults) {
      options.push({ id: 'previous', label: 'Previous' });
    }
    
    if (multipleComparisonResults && multipleComparisonResults.length > 0) {
      multipleComparisonResults.forEach((result, index) => {
        options.push({ 
          id: `multi-${index}`, 
          label: result.label || `Result ${index + 1}` 
        });
      });
    }
    
    return options;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CompareIcon sx={{ fontSize: 28, color: theme.palette.primary.main, mr: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Results Comparison
          </Typography>
        </Box>
        
        <IconButton onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
        
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleClearAll}>
            <ListItemIcon>
              <ClearAllIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Clear All Comparison Results</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export Comparison</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
      
      {/* Select comparison results */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Select Results to Compare
        </Typography>
        
        <Grid container spacing={3}>
          {selectedResults.map((resultId, index) => (
            <Grid item xs={12} md={6} key={index}>
              <FormControl fullWidth>
                <InputLabel id={`select-result-${index}-label`}>Result {index + 1}</InputLabel>
                <Select
                  labelId={`select-result-${index}-label`}
                  value={resultId}
                  label={`Result ${index + 1}`}
                  onChange={(e) => handleSelectionChange(e, resultId)}
                >
                  {getAvailableResults().map(option => (
                    <MenuItem key={option.id} value={option.id}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}
        </Grid>
        
        {multipleComparisonResults && multipleComparisonResults.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Saved Comparison Results
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {multipleComparisonResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.label || `Result ${index + 1}`}</TableCell>
                      <TableCell>
                        {result.is_optimized ? (
                          <Chip 
                            size="small" 
                            label={result.optimization_method || "Optimized"} 
                            color="secondary"
                          />
                        ) : (
                          <Chip size="small" label="Manual" color="primary" />
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(result.timestamp || Date.now()).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleDeleteResult(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>
      
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          backgroundColor: alpha(theme.palette.primary.main, 0.03)
        }}
      >
        <Typography variant="h6" color="primary.main" gutterBottom fontWeight="medium">
          Comparison Summary
        </Typography>
        
        <Grid container spacing={3}>
          {comparisonResults.map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card elevation={0} sx={{ height: '100%', backgroundColor: 'transparent', border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: item.color,
                        mr: 1
                      }} 
                    />
                    <Typography variant="subtitle1" fontWeight="medium" color="text.primary">
                      {item.label}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Structure Size</Typography>
                    <Typography variant="h6">
                      {formatCurrency((item.result.class_a_total || 0) + (item.result.class_b_total || 0))}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">Minimum Buffer</Typography>
                    <Typography variant="h6" color={
                      (item.result.min_buffer_actual || 0) >= 5.0 ? 'success.main' : 'error.main'
                    }>
                      {formatPercent(item.result.min_buffer_actual || 0)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">Financing Result</Typography>
                    <Typography variant="h6" color={
                      (item.result.financing_cost || 0) > 0 ? 'success.main' : 'error.main'
                    }>
                      {(item.result.financing_cost || 0) > 0 ? "Profit: " : "Loss: "}
                      {formatCurrency(Math.abs(item.result.financing_cost || 0))}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* Tabs for different comparison views */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 2,
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 3
            }
          }}
        >
          <Tab icon={<PieChartIcon />} label="Structure Comparison" iconPosition="start" />
          <Tab icon={<BarChartIcon />} label="Tranches Breakdown" iconPosition="start" />
          <Tab icon={<AccountBalanceWalletIcon />} label="Financing Comparison" iconPosition="start" />
          <Tab icon={<TimelineIcon />} label="Buffer Analysis" iconPosition="start" />
        </Tabs>
      </Box>
      
      {/* Tab 1: Structure Comparison */}
      {tabValue === 0 && (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight="medium">
                Total Structure Comparison
              </Typography>
              
              <Box sx={{ height: 400, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.07)} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `₺${value/1000000}M`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="classA" 
                      name="Class A" 
                      stackId="a"
                      fill={theme.palette.primary.main} 
                    />
                    <Bar 
                      dataKey="classB" 
                      name="Class B" 
                      stackId="a"
                      fill={theme.palette.secondary.main} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Class Distribution
              </Typography>
              
              <Grid container spacing={4}>
                {comparisonResults.map((item, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Typography variant="subtitle2" align="center" gutterBottom>
                      {item.label}
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Class A', value: item.result.class_a_total || 0 },
                              { name: 'Class B', value: item.result.class_b_total || 0 }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                          >
                            <Cell fill={theme.palette.primary.main} />
                            <Cell fill={theme.palette.secondary.main} />
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Tab 2: Tranches Breakdown */}
      {tabValue === 1 && (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight="medium">
                Principal & Interest Breakdown
              </Typography>
              
              <Box sx={{ height: 400, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={breakdownData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.07)} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `₺${value/1000000}M`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="classAPrincipal" name="Class A Principal" stackId="a" fill={theme.palette.primary.dark} />
                    <Bar dataKey="classAInterest" name="Class A Interest" stackId="a" fill={theme.palette.primary.light} />
                    <Bar dataKey="classBPrincipal" name="Class B Principal" stackId="b" fill={theme.palette.secondary.dark} />
                    <Bar dataKey="classBCoupon" name="Class B Coupon" stackId="b" fill={theme.palette.secondary.light} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              
              // ComparisonPage.js continued
              <Divider sx={{ my: 3 }} />
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      {comparisonResults.map((item, index) => (
                        <TableCell key={index} align="right">{item.label}</TableCell>
                      ))}
                      {comparisonResults.length > 1 && (
                        <TableCell align="right">Difference</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Class A Principal</TableCell>
                      {comparisonResults.map((item, index) => (
                        <TableCell key={index} align="right">
                          {formatCurrency(item.result.class_a_principal || 0)}
                        </TableCell>
                      ))}
                      {comparisonResults.length > 1 && (
                        <TableCell align="right">
                          {formatDifference(calculateDifference(
                            comparisonResults[0].result.class_a_principal,
                            comparisonResults[1].result.class_a_principal
                          ))}
                        </TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell>Class A Interest</TableCell>
                      {comparisonResults.map((item, index) => (
                        <TableCell key={index} align="right">
                          {formatCurrency(item.result.class_a_interest || 0)}
                        </TableCell>
                      ))}
                      {comparisonResults.length > 1 && (
                        <TableCell align="right">
                          {formatDifference(calculateDifference(
                            comparisonResults[0].result.class_a_interest,
                            comparisonResults[1].result.class_a_interest
                          ))}
                        </TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell>Class B Principal</TableCell>
                      {comparisonResults.map((item, index) => (
                        <TableCell key={index} align="right">
                          {formatCurrency(item.result.class_b_principal || 0)}
                        </TableCell>
                      ))}
                      {comparisonResults.length > 1 && (
                        <TableCell align="right">
                          {formatDifference(calculateDifference(
                            comparisonResults[0].result.class_b_principal,
                            comparisonResults[1].result.class_b_principal
                          ))}
                        </TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell>Class B Coupon</TableCell>
                      {comparisonResults.map((item, index) => (
                        <TableCell key={index} align="right">
                          {formatCurrency(item.result.class_b_coupon || 0)}
                        </TableCell>
                      ))}
                      {comparisonResults.length > 1 && (
                        <TableCell align="right">
                          {formatDifference(calculateDifference(
                            comparisonResults[0].result.class_b_coupon,
                            comparisonResults[1].result.class_b_coupon
                          ))}
                        </TableCell>
                      )}
                    </TableRow>
                    <TableRow sx={{ "& td": { fontWeight: 'medium', backgroundColor: alpha(theme.palette.primary.main, 0.05) } }}>
                      <TableCell>Total</TableCell>
                      {comparisonResults.map((item, index) => (
                        <TableCell key={index} align="right">
                          {formatCurrency(
                            (item.result.class_a_total || 0) + (item.result.class_b_total || 0)
                          )}
                        </TableCell>
                      ))}
                      {comparisonResults.length > 1 && (
                        <TableCell align="right">
                          {formatDifference(calculateDifference(
                            (comparisonResults[0].result.class_a_total || 0) + (comparisonResults[0].result.class_b_total || 0),
                            (comparisonResults[1].result.class_a_total || 0) + (comparisonResults[1].result.class_b_total || 0)
                          ))}
                        </TableCell>
                      )}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Tab 3: Financing Comparison */}
      {tabValue === 2 && (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                backgroundColor: alpha(theme.palette.info.main, 0.03)
              }}
            >
              <Typography variant="h6" color="info.main" gutterBottom fontWeight="medium">
                Financing Comparison
              </Typography>
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                  <Box sx={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={financingData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.07)} />
                        <XAxis type="number" tickFormatter={(value) => `₺${value/1000000}M`} />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar 
                          dataKey="principalPaid" 
                          name="Total Principal Paid" 
                          fill={theme.palette.primary.main} 
                        />
                        <Bar 
                          dataKey="loanPrincipal" 
                          name="Total Loan Principal" 
                          fill={theme.palette.info.main} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={5}>
                  <Box sx={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={financingData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.07)} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `₺${value/1000000}M`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar 
                          dataKey="financingCost" 
                          name="Financing Result" 
                          radius={[4, 4, 0, 0]}
                        >
                          {financingData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.isProfit ? theme.palette.success.main : theme.palette.error.main}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      {comparisonResults.map((item, index) => (
                        <TableCell key={index} align="right">{item.label}</TableCell>
                      ))}
                      {comparisonResults.length > 1 && (
                        <TableCell align="right">Difference</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Principal Paid</TableCell>
                      {comparisonResults.map((item, index) => (
                        <TableCell key={index} align="right">
                          {formatCurrency(item.result.total_principal_paid || 0)}
                        </TableCell>
                      ))}
                      {comparisonResults.length > 1 && (
                        <TableCell align="right">
                          {formatDifference(calculateDifference(
                            comparisonResults[0].result.total_principal_paid,
                            comparisonResults[1].result.total_principal_paid
                          ))}
                        </TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Loan Principal</TableCell>
                      {comparisonResults.map((item, index) => (
                        <TableCell key={index} align="right">
                          {formatCurrency(item.result.total_loan_principal || 0)}
                        </TableCell>
                      ))}
                      {comparisonResults.length > 1 && (
                        <TableCell align="right">
                          {formatDifference(calculateDifference(
                            comparisonResults[0].result.total_loan_principal,
                            comparisonResults[1].result.total_loan_principal
                          ))}
                        </TableCell>
                      )}
                    </TableRow>
                    <TableRow sx={{ 
                      "& td": { 
                        fontWeight: 'medium', 
                        backgroundColor: alpha(theme.palette.info.main, 0.05) 
                      } 
                    }}>
                      <TableCell>Financing Result</TableCell>
                      {comparisonResults.map((item, index) => (
                        <TableCell 
                          key={index} 
                          align="right"
                          sx={{ 
                            color: (item.result.financing_cost || 0) > 0 
                              ? 'success.main' 
                              : 'error.main' 
                          }}
                        >
                          {(item.result.financing_cost || 0) > 0 ? "Profit: " : "Loss: "}
                          {formatCurrency(Math.abs(item.result.financing_cost || 0))}
                        </TableCell>
                      ))}
                      {comparisonResults.length > 1 && (
                        <TableCell align="right">
                          {formatDifference(calculateDifference(
                            Math.abs(comparisonResults[0].result.financing_cost || 0),
                            Math.abs(comparisonResults[1].result.financing_cost || 0)
                          ))}
                        </TableCell>
                      )}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Tab 4: Buffer Analysis */}
      {tabValue === 3 && (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                backgroundColor: alpha(theme.palette.success.main, 0.03)
              }}
            >
              <Typography variant="h6" color="success.main" gutterBottom fontWeight="medium">
                Buffer Analysis
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Alert 
                  severity="info" 
                  sx={{ mb: 2 }}
                >
                  Minimum buffer requirement is 5.0%. Values below this threshold may result in cash flow issues.
                </Alert>
              </Box>
              
              <Box sx={{ height: 400, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={bufferData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.07)} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value}%`} domain={[0, 'dataMax + 2']} />
                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                    <Legend />
                    <ReferenceLine 
                      y={5} 
                      label="Min Requirement" 
                      stroke="red" 
                      strokeDasharray="3 3" 
                    />
                    <Bar dataKey="minBuffer" name="Minimum Buffer" radius={[4, 4, 0, 0]}>
                      {bufferData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.minBuffer >= 5.0 ? theme.palette.success.main : theme.palette.error.main} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Buffer Details by Tranche
              </Typography>
              
              {comparisonResults.map((resultItem, resultIndex) => (
                <Box key={resultIndex} sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    color: resultItem.color
                  }}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: resultItem.color,
                        mr: 1 
                      }} 
                    />
                    {resultItem.label}
                  </Typography>
                  
                  {resultItem.result.tranche_results ? (
                    <TableContainer sx={{ mb: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tranche</TableCell>
                            <TableCell align="right">Maturity Days</TableCell>
                            <TableCell align="right">Total Payment</TableCell>
                            <TableCell align="right">Buffer Ratio (%)</TableCell>
                            <TableCell align="right">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {resultItem.result.tranche_results
                            .filter(tranche => tranche["Is Class A"])
                            .map((tranche, index) => (
                              <TableRow key={index}>
                                <TableCell>{tranche["Tranche"]}</TableCell>
                                <TableCell align="right">{tranche["Maturity Days"]}</TableCell>
                                <TableCell align="right">{formatCurrency(tranche["Total Payment"])}</TableCell>
                                <TableCell align="right">{formatPercent(tranche["Buffer Cash Flow Ratio (%)"])}</TableCell>
                                <TableCell align="right">
                                  <Chip 
                                    size="small" 
                                    label={tranche["Buffer Cash Flow Ratio (%)"] >= 5.0 ? "OK" : "Low"} 
                                    color={tranche["Buffer Cash Flow Ratio (%)"] >= 5.0 ? "success" : "error"} 
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Detailed tranche data not available for this result.
                    </Typography>
                  )}
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default ComparisonPage;