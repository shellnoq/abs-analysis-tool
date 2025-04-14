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
      main: '#d32f2f', // Ana kırmızı
      light: '#ef5350',
      dark: '#b71c1c',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c2185b', // Pembe-kırmızı
      light: '#e91e63',
      dark: '#880e4f',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ff1744',
      light: '#ff4569',
      dark: '#d50000',
    },
    warning: {
      main: '#ff9100',
      light: '#ffb74d',
      dark: '#e65100',
    },
    info: {
      main: '#f44336',
      light: '#ef9a9a',
      dark: '#c62828',
    },
    success: {
      main: '#8bc34a',
      light: '#aed581',
      dark: '#689f38',
    },
    background: {
      default: '#fff5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#3e2723',
      secondary: '#5d4037',
    },
    divider: 'rgba(211, 47, 47, 0.12)',
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
          backgroundColor: 'rgba(211, 47, 47, 0.05)',
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