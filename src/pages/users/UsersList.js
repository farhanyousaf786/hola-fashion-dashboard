import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsersWithOrderCounts } from '../../firebase/services/userService';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Users</Typography>
      {loading && <Typography>Loading users...</Typography>}
      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}
      {!loading && users.length === 0 && (
        <Typography>No users found.</Typography>
      )}

      <Grid container spacing={2}>
        {users.map((u) => (
          <Grid item key={u.uid || u.id} xs={12} sm={6} md={4} lg={3}>
            <Card>
              <CardActionArea onClick={() => navigate(`/users/${u.uid || u.id}`)}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <PersonIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                      {u.name || u.email || (u.uid || u.id)}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                    UID: {u.uid || u.id}
                  </Typography>
                  <Box mt={1}>
                    <Chip
                      size="small"
                      color="primary"
                      icon={<ShoppingBagIcon />}
                      label={`${u.orderCount || 0} orders`}
                    />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default UsersList;
