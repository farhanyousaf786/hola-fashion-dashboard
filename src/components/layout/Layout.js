import React, { useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, CssBaseline, Button, Avatar } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, signOut } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Brand Title */}
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              color: 'white',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Rallina Dashboard
          </Typography>
          
          {/* Spacer to push user content to the right */}
          <Box sx={{ flexGrow: 1 }} />
          
          {/* User info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: '0.875rem'
              }}
            >
              {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'white',
                display: { xs: 'none', sm: 'block' },
                fontWeight: 500
              }}
            >
              {currentUser?.email ? currentUser.email.split('@')[0] : 'User'}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ display: 'flex', marginTop: '64px' }}>
        <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
