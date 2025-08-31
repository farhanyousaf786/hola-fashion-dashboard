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
import UsersList from './pages/users/UsersList';
import UserDetail from './pages/users/UserDetail';
import OrderDetail from './pages/orders/order_detail/OrderDetail';
import ShippingPage from './pages/orders/order_detail/shipping/ShippingPage';

// Import Firebase and Auth context
import './firebase/firebase';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import { Box } from '@mui/material';

// Create theme with Rallina brand colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#E94949', // Rallina main brand color
      light: '#ED6B6B', // Lighter shade of brand color
      dark: '#C73E3E', // Darker shade of brand color
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#000000', // Black as secondary color
      light: '#333333', // Dark gray
      dark: '#000000', // Pure black
      contrastText: '#ffffff',
    },
    error: {
      main: '#E94949', // Use brand color for error states too
      light: '#ED6B6B',
      dark: '#C73E3E',
    },
    text: {
      primary: '#000000', // Black text for better readability
      secondary: '#666666', // Gray for secondary text
    },
    background: {
      default: '#ffffff', // White background
      paper: '#ffffff', // White paper background
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // Body text font
    h1: {
      fontFamily: '"Playfair Display", serif',
      color: '#000000',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      color: '#000000',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      color: '#000000',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Playfair Display", serif',
      color: '#000000',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Playfair Display", serif',
      color: '#000000',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Playfair Display", serif',
      color: '#000000',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: '#E94949',
          '&:hover': {
            backgroundColor: '#C73E3E',
          },
        },
        containedSecondary: {
          backgroundColor: '#000000',
          '&:hover': {
            backgroundColor: '#333333',
          },
        },
      },
    },
    // Customize AppBar styles
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#E94949',
          borderRadius: '0 !important', // Force remove any rounded corners
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Clean shadow
          '& .MuiPaper-root': {
            borderRadius: '0 !important',
          },
        },
      },
    },
    // Customize Paper styles
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Auth-aware App Component
const AuthenticatedApp = () => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        Loading...
      </Box>
    );
  }
  
  // If user is not authenticated, show only login page (no sidebar)
  if (!currentUser) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Login />
      </Box>
    );
  }
  
  // If user is authenticated, show full dashboard with sidebar
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/all-items" element={<ItemsPage />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/users/:uid" element={<UserDetail />} />
          {/* Order detail route with optional uid parameter */}
          <Route path="/orderdetail/:orderId" element={<OrderDetail />} />
          <Route path="/users/:uid/orders/:orderId" element={<OrderDetail />} />
          {/* Add a catch-all route for order details */}
          <Route path="/orders/:orderId" element={<OrderDetail />} />
          <Route path="/orders/:orderId/shipping" element={<ShippingPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
