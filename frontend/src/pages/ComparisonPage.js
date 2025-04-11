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
  useTheme
} from '@mui/material';
import { useData } from '../contexts/DataContext';
import CompareIcon from '@mui/icons-material/Compare';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Area, AreaChart, ScatterChart, Scatter, ZAxis
} from "recharts";

const ComparisonPage = () => {
  const theme = useTheme();
  const { calculationResults, previousCalculationResults } = useData();
  const [tabValue, setTabValue] = useState(0);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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

  // Check if we have data to compare
  if (!calculationResults || !previousCalculationResults) {
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
        </Paper>
      </Container>
    );
  }

  // Extract relevant data for comparison
  const current = {
    classATotal: calculationResults.class_a_total || 0,
    classBTotal: calculationResults.class_b_total || 0,
    classAPrincipal: calculationResults.class_a_principal || 0,
    classBPrincipal: calculationResults.class_b_principal || 0,
    classAInterest: calculationResults.class_a_interest || 0,
    classBCoupon: calculationResults.class_b_coupon || 0,
    minBufferActual: calculationResults.min_buffer_actual || 0,
    totalPrincipalPaid: calculationResults.total_principal_paid || 0,
    totalLoanPrincipal: calculationResults.total_loan_principal || 0,
    financingCost: calculationResults.financing_cost || 0,
    trancheResults: calculationResults.tranche_results || []
  };

  const previous = {
    classATotal: previousCalculationResults.class_a_total || 0,
    classBTotal: previousCalculationResults.class_b_total || 0,
    classAPrincipal: previousCalculationResults.class_a_principal || 0,
    classBPrincipal: previousCalculationResults.class_b_principal || 0,
    classAInterest: previousCalculationResults.class_a_interest || 0,
    classBCoupon: previousCalculationResults.class_b_coupon || 0,
    minBufferActual: previousCalculationResults.min_buffer_actual || 0,
    totalPrincipalPaid: previousCalculationResults.total_principal_paid || 0,
    totalLoanPrincipal: previousCalculationResults.total_loan_principal || 0,
    financingCost: previousCalculationResults.financing_cost || 0,
    trancheResults: previousCalculationResults.tranche_results || []
  };

  // Calculate differences
  const diff = {
    classATotal: calculateDifference(current.classATotal, previous.classATotal),
    classBTotal: calculateDifference(current.classBTotal, previous.classBTotal),
    classAPrincipal: calculateDifference(current.classAPrincipal, previous.classAPrincipal),
    classBPrincipal: calculateDifference(current.classBPrincipal, previous.classBPrincipal),
    classAInterest: calculateDifference(current.classAInterest, previous.classAInterest),
    classBCoupon: calculateDifference(current.classBCoupon, previous.classBCoupon),
    minBufferActual: calculateDifference(current.minBufferActual, previous.minBufferActual),
    totalPrincipalPaid: calculateDifference(current.totalPrincipalPaid, previous.totalPrincipalPaid),
    financingCost: calculateDifference(
      Math.abs(current.financingCost), 
      Math.abs(previous.financingCost)
    ),
  };

  // Prepare data for tranche comparison charts
  const trancheComparisonData = [
    {
      name: "Class A",
      current: current.classATotal,
      previous: previous.classATotal,
      diff: diff.classATotal
    },
    {
      name: "Class B",
      current: current.classBTotal,
      previous: previous.classBTotal,
      diff: diff.classBTotal
    }
  ];

  // Prepare data for principal-interest breakdown
  const breakdownData = [
    {
      name: "Class A Principal",
      current: current.classAPrincipal,
      previous: previous.classAPrincipal,
      diff: diff.classAPrincipal
    },
    {
      name: "Class A Interest",
      current: current.classAInterest,
      previous: previous.classAInterest,
      diff: diff.classAInterest
    },
    {
      name: "Class B Principal",
      current: current.classBPrincipal,
      previous: previous.classBPrincipal,
      diff: diff.classBPrincipal
    },
    {
      name: "Class B Coupon",
      current: current.classBCoupon,
      previous: previous.classBCoupon,
      diff: diff.classBCoupon
    }
  ];

  // Financing comparison data
  const financingData = [
    {
      name: "Total Principal Paid",
      current: current.totalPrincipalPaid,
      previous: previous.totalPrincipalPaid,
      diff: diff.totalPrincipalPaid
    },
    {
      name: "Total Loan Principal",
      current: current.totalLoanPrincipal,
      previous: previous.totalLoanPrincipal,
      diff: 0  // Usually this doesn't change
    },
    {
      name: "Financing Result",
      current: Math.abs(current.financingCost),
      previous: Math.abs(previous.financingCost),
      diff: diff.financingCost,
      isProfit: current.financingCost > 0
    }
  ];

  // Chart colors
  const previousColor = theme.palette.grey[500];
  const currentColor = theme.palette.primary.main;
  const diffColor = theme.palette.secondary.main;
  
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
                {entry.name.includes('diff') 
                  ? `${entry.value > 0 ? '+' : ''}${entry.value.toFixed(2)}%` 
                  : formatCurrency(entry.value)}
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CompareIcon sx={{ fontSize: 28, color: theme.palette.primary.main, mr: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Results Comparison
        </Typography>
      </Box>
      
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
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ height: '100%', backgroundColor: 'transparent', border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}` }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Structure Size
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Previous:</Typography>
                  <Typography variant="h6">
                    {formatCurrency(previous.classATotal + previous.classBTotal)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Current:</Typography>
                  <Typography variant="h6" color="primary.main">
                    {formatCurrency(current.classATotal + current.classBTotal)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight="medium">Difference:</Typography>
                  {formatDifference(calculateDifference(
                    current.classATotal + current.classBTotal,
                    previous.classATotal + previous.classBTotal
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ height: '100%', backgroundColor: 'transparent', border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}` }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Minimum Buffer (Class A)
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Previous:</Typography>
                  <Typography variant="h6">
                    {formatPercent(previous.minBufferActual)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Current:</Typography>
                  <Typography variant="h6" color="primary.main">
                    {formatPercent(current.minBufferActual)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight="medium">Difference:</Typography>
                  {formatDifference(diff.minBufferActual)}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ height: '100%', backgroundColor: 'transparent', border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}` }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Financing Result
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Previous:</Typography>
                  <Typography variant="h6" color={previous.financingCost > 0 ? "success.main" : "error.main"}>
                    {previous.financingCost > 0 ? "Profit" : "Loss"}: {formatCurrency(Math.abs(previous.financingCost))}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Current:</Typography>
                  <Typography variant="h6" color={current.financingCost > 0 ? "success.main" : "error.main"}>
                    {current.financingCost > 0 ? "Profit" : "Loss"}: {formatCurrency(Math.abs(current.financingCost))}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight="medium">Difference:</Typography>
                  {formatDifference(diff.financingCost)}
                </Box>
              </CardContent>
            </Card>
          </Grid>
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
          <Tab icon={<TimelineIcon />} label="Tranche Details" iconPosition="start" />
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
                Class Structure Comparison
              </Typography>
              
              <Box sx={{ height: 400, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trancheComparisonData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.07)} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `₺${value/1000000}M`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="previous" name="Previous" fill={previousColor} />
                    <Bar dataKey="current" name="Current" fill={currentColor} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Distribution Comparison
              </Typography>
              
              <Grid container spacing={4}>
                {/* Previous Distribution */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" align="center" gutterBottom>
                    Previous Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Class A', value: previous.classATotal },
                            { name: 'Class B', value: previous.classBTotal }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill={previousColor}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                        >
                          <Cell fill={alpha(previousColor, 0.8)} />
                          <Cell fill={alpha(previousColor, 0.5)} />
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                
                {/* Current Distribution */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" align="center" gutterBottom>
                    Current Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Class A', value: current.classATotal },
                            { name: 'Class B', value: current.classBTotal }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill={currentColor}
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
                    <Bar dataKey="previous" name="Previous" fill={previousColor} />
                    <Bar dataKey="current" name="Current" fill={currentColor} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell align="right">Previous</TableCell>
                      <TableCell align="right">Current</TableCell>
                      <TableCell align="right">Difference</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {breakdownData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{formatCurrency(item.previous)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.current)}</TableCell>
                        <TableCell align="right">{formatDifference(item.diff)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ "& td": { fontWeight: 'medium', backgroundColor: alpha(theme.palette.primary.main, 0.05) } }}>
                      <TableCell>Total</TableCell>
                      <TableCell align="right">
                        {formatCurrency(previous.classATotal + previous.classBTotal)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(current.classATotal + current.classBTotal)}
                      </TableCell>
                      <TableCell align="right">
                        {formatDifference(calculateDifference(
                          current.classATotal + current.classBTotal,
                          previous.classATotal + previous.classBTotal
                        ))}
                      </TableCell>
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
                <Grid item xs={12} md={6}>
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
                        <Bar dataKey="previous" name="Previous" fill={previousColor} />
                        <Bar dataKey="current" name="Current" fill={currentColor} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2, height: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Financing Result Summary
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      The financing result has changed from 
                      <strong> {previous.financingCost > 0 ? "profit" : "loss"} of {formatCurrency(Math.abs(previous.financingCost))} </strong> 
                      to 
                      <strong> {current.financingCost > 0 ? "profit" : "loss"} of {formatCurrency(Math.abs(current.financingCost))}</strong>.
                    </Typography>
                    
                    <Typography variant="body1">
                      This represents a <strong>{formatDifference(diff.financingCost)}</strong> change in the financing result.
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Metric</TableCell>
                            <TableCell align="right">Previous</TableCell>
                            <TableCell align="right">Current</TableCell>
                            <TableCell align="right">Difference</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {financingData.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell align="right">{formatCurrency(item.previous)}</TableCell>
                              <TableCell align="right">{formatCurrency(item.current)}</TableCell>
                              <TableCell align="right">{formatDifference(item.diff)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Tab 4: Tranche Details */}
      {tabValue === 3 && (
        <Box>
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
              Tranche Details Comparison
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Previous Structure
            </Typography>
            
            <TableContainer sx={{ mb: 4 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tranche</TableCell>
                    <TableCell align="right">Maturity Days</TableCell>
                    <TableCell align="right">Principal</TableCell>
                    <TableCell align="right">Interest/Coupon</TableCell>
                    <TableCell align="right">Total Payment</TableCell>
                    <TableCell align="right">Buffer Ratio (%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previous.trancheResults.map((tranche, index) => (
                    <TableRow key={index}>
                      <TableCell>{tranche["Tranche"]}</TableCell>
                      <TableCell align="right">{tranche["Maturity Days"]}</TableCell>
                      <TableCell align="right">{formatCurrency(tranche["Principal"])}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(tranche["Is Class A"] ? tranche["Interest"] : tranche["Coupon Payment"])}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(tranche["Total Payment"])}</TableCell>
                      <TableCell align="right">{formatPercent(tranche["Buffer Cash Flow Ratio (%)"])}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
              Current Structure
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tranche</TableCell>
                    <TableCell align="right">Maturity Days</TableCell>
                    <TableCell align="right">Principal</TableCell>
                    <TableCell align="right">Interest/Coupon</TableCell>
                    <TableCell align="right">Total Payment</TableCell>
                    <TableCell align="right">Buffer Ratio (%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {current.trancheResults.map((tranche, index) => (
                    <TableRow key={index}>
                      <TableCell>{tranche["Tranche"]}</TableCell>
                      <TableCell align="right">{tranche["Maturity Days"]}</TableCell>
                      <TableCell align="right">{formatCurrency(tranche["Principal"])}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(tranche["Is Class A"] ? tranche["Interest"] : tranche["Coupon Payment"])}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(tranche["Total Payment"])}</TableCell>
                      <TableCell align="right">{formatPercent(tranche["Buffer Cash Flow Ratio (%)"])}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default ComparisonPage;