// frontend/src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Paper, 
  alpha,
  Divider 
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import OptimizeIcon from '@mui/icons-material/Speed';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTheme } from '@mui/material/styles';
import { useData } from '../contexts/DataContext';
import FileUploader from '../components/FileUploader';

const HomePage = () => {
  const { cashFlowData } = useData();
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          py: 6,
          px: { xs: 3, md: 6 },
          mb: 5,
          textAlign: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          borderRadius: 3,
          color: 'white',
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom fontWeight="500">
          ABS Analysis Tool
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 400, opacity: 0.9 }}>
          Comprehensive cash flow analysis and optimization for asset-backed securities
        </Typography>
        <Divider sx={{ 
          width: '80px', 
          mx: 'auto', 
          mb: 3, 
          borderColor: 'rgba(255,255,255,0.3)' 
        }} />
        <Typography variant="body1" sx={{ maxWidth: '800px', mx: 'auto', opacity: 0.8 }}>
          Upload your Excel data file to begin analyzing your cash flows, 
          calculate securitization structures, and optimize your tranches for maximum returns.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Typography variant="h5" gutterBottom fontWeight="medium" sx={{ mb: 3 }}>
              Upload Your Cash Flow Data
            </Typography>
            <FileUploader />
          </Paper>
        </Grid>

        {cashFlowData && (
          <>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  },
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2.5
                }}>
                  <Box sx={{ 
                    backgroundColor: alpha(theme.palette.primary.main, 0.1), 
                    borderRadius: '50%', 
                    p: 1.5, 
                    mr: 2 
                  }}>
                    <CalculateIcon sx={{ fontSize: 30, color: theme.palette.primary.main }} />
                  </Box>
                  <Typography variant="h5" fontWeight="medium" color="primary.main">
                    Calculate Results
                  </Typography>
                </Box>
                
                <Typography paragraph sx={{ color: 'text.secondary', mb: 3 }}>
                  Configure tranche parameters and calculate detailed results for your
                  ABS structure. Analyze cash flows, interest rates, and buffer ratios to
                  ensure your securitization meets all requirements.
                </Typography>
                
                <Box sx={{ mt: 'auto', textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/calculation"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      mt: 2, 
                      py: 1, 
                      px: 3,
                      fontWeight: 500,
                      borderRadius: 2,
                    }}
                  >
                    Start Calculation
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.15)}`,
                    borderColor: alpha(theme.palette.secondary.main, 0.3),
                  },
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2.5
                }}>
                  <Box sx={{ 
                    backgroundColor: alpha(theme.palette.secondary.main, 0.1), 
                    borderRadius: '50%', 
                    p: 1.5, 
                    mr: 2 
                  }}>
                    <OptimizeIcon sx={{ fontSize: 30, color: theme.palette.secondary.main }} />
                  </Box>
                  <Typography variant="h5" fontWeight="medium" color="secondary.main">
                    Optimize Structure
                  </Typography>
                </Box>
                
                <Typography paragraph sx={{ color: 'text.secondary', mb: 3 }}>
                  Find the optimal ABS structure to maximize total principal
                  while maintaining minimum buffer requirements. Our advanced optimization
                  algorithms explore multiple strategies to find the best tranche configuration.
                </Typography>
                
                <Box sx={{ mt: 'auto', textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    component={Link}
                    to="/optimization"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      mt: 2, 
                      py: 1, 
                      px: 3,
                      fontWeight: 500,
                      borderRadius: 2
                    }}
                  >
                    Run Optimization
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  );
};

export default HomePage;