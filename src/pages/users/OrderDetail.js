import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { getUserOrder, getUserById } from '../../firebase/services/userService';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Divider,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const formatDate = (ts) => {
  if (!ts) return '';
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

const OrderDetail = () => {
  const { uid, orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [u, o] = await Promise.all([
          getUserById(uid),
          getUserOrder(uid, orderId),
        ]);
        setUser(u);
        setOrder(o);
      } catch (e) {
        setError(e.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uid, orderId]);

  return (
    <Box p={3}>
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Typography variant="h5">Order Detail</Typography>
      </Stack>

      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      {order && (
        <>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6">Order #{order.id}</Typography>
              {order.status && <Chip size="small" label={order.status} color={order.status === 'completed' ? 'success' : 'default'} />}
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Placed</Typography>
                <Typography variant="body1">{formatDate(order.createdAt)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Total</Typography>
                <Typography variant="body1">{currency(order.total || order.amount)}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Customer</Typography>
                <Button component={RouterLink} to={`/users/${uid}`} size="small">
                  {user?.name || user?.email || uid}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <Typography variant="h6" gutterBottom>Items</Typography>
          <Divider sx={{ mb: 2 }} />
          {Array.isArray(order.items) && order.items.length > 0 ? (
            <List>
              {order.items.map((it, idx) => (
                <ListItem key={idx} divider>
                  <ListItemText
                    primary={`${it.name || it.title || 'Item'} x${it.quantity || 1}`}
                    secondary={currency(it.price) || ''}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">No items listed.</Typography>
          )}

          {order.shipping && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Shipping</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                {order.shipping.address || '-'}
              </Typography>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default OrderDetail;
