import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { blue, teal } from '@mui/material/colors';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import WeatherDetails from './pages/WeatherDetails';
import Recommendations from './pages/Recommendations';
import Hyperlocal from './pages/Hyperlocal';
import Impact from './pages/Impact';
import Profile from './pages/Profile';

const theme = createTheme({
  palette: {
    primary: {
      main: blue[700],
    },
    secondary: {
      main: teal[500],
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/weather/:location" element={<WeatherDetails />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/hyperlocal" element={<Hyperlocal />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;