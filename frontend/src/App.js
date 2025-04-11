// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import TopBar from "./components/TopBar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CalculationPage from "./pages/CalculationPage";
import OptimizationPage from "./pages/OptimizationPage";
import { DataProvider } from "./contexts/DataContext";
import ComparisonPage from "./pages/ComparisonPage";



const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // More professional blue
      light: '#4791db',
      dark: '#115293',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#26a69a', // Teal - more business-like than green
      light: '#51b7ae',
      dark: '#00766c',
      contrastText: '#ffffff',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#546e7a',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography: {
    fontFamily: '"Roboto", "Segoe UI", "Helvetica Neue", sans-serif',
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.04)',
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.04)',
        },
        elevation2: {
          boxShadow: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 6,
        },
        contained: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DataProvider>
        <Router>
          <TopBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/calculation" element={<CalculationPage />} />
            <Route path="/optimization" element={<OptimizationPage />} />
            <Route path="/comparison" element={<ComparisonPage />} />
          </Routes>
          <Footer />
        </Router>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;