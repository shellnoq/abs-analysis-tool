// frontend/src/components/TopBar.js
import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import OptimizeIcon from '@mui/icons-material/Speed';
import HomeIcon from '@mui/icons-material/Home';
import CompareIcon from '@mui/icons-material/Compare';
import { alpha } from '@mui/material/styles';


const TopBar = () => {
  const location = useLocation();
  
  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              fontWeight: 600,
            }}
          >
            ABS Analysis Tool
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/"
              startIcon={<HomeIcon />}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 1,
                backgroundColor: location.pathname === '/' ? alpha('#fff', 0.15) : 'transparent',
                '&:hover': {
                  backgroundColor: location.pathname === '/' ? alpha('#fff', 0.25) : alpha('#fff', 0.1),
                }
              }}
            >
              Home
            </Button>
            
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/calculation"
              startIcon={<CalculateIcon />}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 1,
                backgroundColor: location.pathname === '/calculation' ? alpha('#fff', 0.15) : 'transparent',
                '&:hover': {
                  backgroundColor: location.pathname === '/calculation' ? alpha('#fff', 0.25) : alpha('#fff', 0.1),
                }
              }}
            >
              Calculate
            </Button>
            
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/optimization"
              startIcon={<OptimizeIcon />}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 1,
                backgroundColor: location.pathname === '/optimization' ? alpha('#fff', 0.15) : 'transparent',
                '&:hover': {
                  backgroundColor: location.pathname === '/optimization' ? alpha('#fff', 0.25) : alpha('#fff', 0.1),
                }
              }}
            >
              Optimize
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/comparison"
              startIcon={<CompareIcon />}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 1,
                backgroundColor: location.pathname === '/comparison' ? alpha('#fff', 0.15) : 'transparent',
                '&:hover': {
                  backgroundColor: location.pathname === '/comparison' ? alpha('#fff', 0.25) : alpha('#fff', 0.1),
                }
              }}
            >
              Compare
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default TopBar;