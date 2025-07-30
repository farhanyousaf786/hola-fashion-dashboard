import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';

// Import layout
import Layout from './components/layout/Layout';

// Import pages
import Overview from './pages/overview/Overview';
import Orders from './pages/orders/Orders';
import ItemsPage from './pages/items_page/ItemsPage';
import Profile from './pages/profile/Profile';

// Import Firebase and Auth context
import './firebase/firebase';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Create theme with reddish color scheme
const theme = createTheme({
  palette: {
    primary: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#b71c1c',
    },
    secondary: {
      main: '#f50057',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#b71c1c',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <Overview />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } />
              <Route path="/all-items" element={
                <ProtectedRoute>
                  <ItemsPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
