import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import Login from '../../components/auth/Login';
import Signup from '../../components/auth/Signup';

const Profile = () => {
  const { currentUser, loading, signOut } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Set profile data when user changes
  React.useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.displayName || '',
        email: currentUser.email || '',
        phone: '123-456-7890', // Placeholder data
        address: '123 Fashion St, Style City' // Placeholder data
      });
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleToggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleEditProfile = () => {
    setEditMode(!editMode);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handleSaveProfile = () => {
    // Here you would update the user profile in Firebase
    // For now, we'll just exit edit mode
    setEditMode(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress color="error" />
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom color="error">
          Account
        </Typography>
        {isLogin ? (
          <Login onToggleForm={handleToggleForm} />
        ) : (
          <Signup onToggleForm={handleToggleForm} />
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="error">
        My Profile
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'error.main' }}
              alt={profileData.name}
              src="/static/images/avatar/1.jpg"
            />
            <Typography variant="h6" gutterBottom>
              {profileData.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {profileData.email}
            </Typography>
            <Button
              variant="contained"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ mt: 2, px: 3, py: 1 }}
              fullWidth
            >
              Sign Out
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Profile Information
              </Typography>
              <Button
                startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                onClick={editMode ? handleSaveProfile : handleEditProfile}
                color={editMode ? 'success' : 'primary'}
              >
                {editMode ? 'Save' : 'Edit'}
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {editMode ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileChange}
                  />
                </Grid>
              </Grid>
            ) : (
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Full Name" secondary={profileData.name} />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText primary="Email" secondary={profileData.email} />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText primary="Phone" secondary={profileData.phone} />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon />
                  </ListItemIcon>
                  <ListItemText primary="Address" secondary={profileData.address} />
                </ListItem>
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
