import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsersWithOrderCounts } from '../../firebase/services/userService';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  TextField,
  InputAdornment,
  Stack,
  Avatar,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingBag as ShoppingBagIcon,
  Email as EmailIcon,
  PersonOutline as PersonOutlineIcon
} from '@mui/icons-material';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const list = await getAllUsersWithOrderCounts();
        // Sort by most orders first
        list.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
        setUsers(list);
      } catch (e) {
        setError(e.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const getRandomColor = (str) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
    ];
    const index = str ? str.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      (user.email && user.email.toLowerCase().includes(term)) ||
      (user.displayName && user.displayName.toLowerCase().includes(term))
    );
  }, [users, searchTerm]);

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" fontWeight="bold">User Management</Typography>
        <TextField
          size="small"
          placeholder="Search users..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
      </Box>
      
      {loading && <LinearProgress />}
      
      {error && (
        <Box mb={3} p={2} bgcolor="error.light" borderRadius={1}>
          <Typography color="error.main">
            {error}
          </Typography>
        </Box>
      )}
      
      {!loading && users.length === 0 && (
        <Box textAlign="center" p={4}>
          <PersonOutlineIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">No users found</Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Users will appear here once they create an account.
          </Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {filteredUsers.map((user) => {
          const initials = getUserInitials(user.displayName || user.email);
          const bgColor = getRandomColor(user.uid);
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={user.uid}>
              <Card 
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardActionArea 
                  onClick={() => navigate(`/users/${user.uid}`)}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <Box 
                    sx={{
                      height: 100,
                      backgroundColor: alpha(bgColor, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Avatar 
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: bgColor,
                        color: theme.palette.getContrastText(bgColor),
                        fontSize: '1.5rem',
                        border: `3px solid ${theme.palette.background.paper}`,
                        boxShadow: theme.shadows[2],
                      }}
                    >
                      {initials}
                    </Avatar>
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h6" 
                      component="div" 
                      noWrap 
                      title={user.displayName || 'Guest User'}
                      sx={{ mb: 1 }}
                    >
                      {user.displayName || user.email.split('@')[0]}
                    </Typography>
                    
                    <Stack spacing={1} mt={2}>
                      <Box display="flex" alignItems="center">
                        <EmailIcon 
                          fontSize="small" 
                          color="action" 
                          sx={{ mr: 1, color: 'text.secondary' }} 
                        />
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          noWrap
                          title={user.email}
                        >
                          {user.email}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center">
                        <ShoppingBagIcon 
                          fontSize="small" 
                          color="action" 
                          sx={{ mr: 1, color: 'text.secondary' }} 
                        />
                        <Typography variant="body2" color="text.secondary">
                          {user.orderCount || 0} {user.orderCount === 1 ? 'order' : 'orders'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                  
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default UsersList;
