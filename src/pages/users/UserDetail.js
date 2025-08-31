import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, getUserOrders } from '../../firebase/services/userService';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  Chip,
  Stack,
  Button,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

const formatDate = (ts) => {
  if (!ts) return '';
  // Support Firestore Timestamp or ISO/date string
  try {
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString();
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
};

const currency = (n) => {
  if (n === undefined || n === null || isNaN(Number(n))) return '';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(n));
  } catch {
    return `$${Number(n).toFixed(2)}`;
  }
};

const UserDetail = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const u = await getUserById(uid);
        const o = await getUserOrders(uid);
        // Sort orders by createdAt desc if available
        o.sort((a, b) => {
          const ta = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.createdAt || 0).getTime() / 1000;
          const tb = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.createdAt || 0).getTime() / 1000;
          return (tb || 0) - (ta || 0);
        });
        setUser(u);
        setOrders(o);
      } catch (e) {
        setError(e.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uid]);

  return (
    <Box p={3}>
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Typography variant="h5">User Detail</Typography>
      </Stack>

      {loading && <Typography>Loading...</Typography>}
      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {user && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {user.name || user.email || uid}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">UID</Typography>
              <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{user.uid || user.id || uid}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="body1">{user.email || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Name</Typography>
              <Typography variant="body1">{user.name || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Created</Typography>
              <Typography variant="body1">{formatDate(user.createdAt)}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <ShoppingBagIcon color="primary" />
        <Typography variant="h6">Orders ({orders.length})</Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      {orders.length === 0 && !loading && <Typography>No orders found.</Typography>}

      <Grid container spacing={2}>
        {orders.map((o) => (
          <Grid item key={o.id} xs={12} md={6} lg={4}>
            <Card>
              <CardActionArea onClick={() => {
                // For non-anonymous users, include the user ID in the URL
                const isAnonymous = !o.userId && !o.customerDetails?.id;
                const path = isAnonymous 
                  ? `/orderdetail/${o.id}`
                  : `/users/${uid}/orders/${o.id}`;
                navigate(path);
              }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1" fontWeight={600}>#{o.id.slice(0, 6)}</Typography>
                  {o.status && <Chip size="small" label={o.status} color={o.status === 'completed' ? 'success' : 'default'} />}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                  Placed: {formatDate(o.createdAt)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total: {currency(o.total || o.amount)}
                </Typography>
                {Array.isArray(o.items) && (
                  <Typography variant="body2" color="text.secondary">
                    Items: {o.items.length}
                  </Typography>
                )}
              </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default UserDetail;
