import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { getUserById } from '../../../firebase/services/userService';
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

  // Memoized function to find which user has this order
  const findUserWithOrder = React.useCallback(async (orderId) => {
    try {
      // First check if we have a uid in the URL
      if (uid && uid !== 'anonymous') {
        return uid;
      }
      
      console.log('Searching for order in user collections...');
      // If not, try to find the user who has this order
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      for (const userDoc of usersSnapshot.docs) {
        const orderRef = doc(db, 'users', userDoc.id, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          console.log(`Found order in user ${userDoc.id}'s orders`);
          return userDoc.id;
        }
      }
      console.log('Order not found in any user collection');
    } catch (e) {
      console.warn('Error finding user with order:', e);
    }
    return null;
  }, [uid]); // Only recreate when uid changes

  // Memoized function to fetch order from a specific user
  const fetchOrderFromUser = React.useCallback(async (userId) => {
    if (!userId) return null;
    
    try {
      console.log(`Fetching order ${orderId} from user ${userId}`);
      const userOrderRef = doc(db, 'users', userId, 'orders', orderId);
      const userOrderSnap = await getDoc(userOrderRef);
      
      if (userOrderSnap.exists()) {
        const orderData = userOrderSnap.data();
        return {
          id: userOrderSnap.id,
          ...orderData,
          userId: userId,
          customerDetails: {
            ...(orderData.customerDetails || {}),
            id: orderData.userId || userId,
            email: orderData.customer || orderData.customerDetails?.email || 'Unknown'
          },
          items: orderData.items ? (Array.isArray(orderData.items) ? orderData.items : Object.values(orderData.items)) : [],
          status: orderData.status || 'pending',
          total: orderData.total || 0,
          amount: orderData.amount || 0,
          createdAt: orderData.createdAt || orderData.timestamp || new Date()
        };
      }
    } catch (e) {
      console.warn('Error fetching user order:', e);
    }
    return null;
  }, [orderId]);

  // Main effect to load order data
  useEffect(() => {
    let isMounted = true;
    
    const load = async () => {
      if (!orderId) return;
      
      setLoading(true);
      setError('');
      
      try {
        // First try to find which user has this order
        const foundUserId = await findUserWithOrder(orderId);
        
        if (foundUserId) {
          const orderData = await fetchOrderFromUser(foundUserId);
          if (orderData && isMounted) {
            setOrder(orderData);
            try {
              const userData = await getUserById(foundUserId);
              if (isMounted) setUser(userData);
            } catch (e) {
              console.warn('Could not load user details:', e);
            }
            return;
          }
        }
        
        // Try to get the order from the root 'orders' collection
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);
        
        if (orderSnap.exists() && isMounted) {
          // Found in root orders collection
          const orderData = orderSnap.data();
          setOrder(orderData);
          
          // Try to get user details if available
          const userId = orderData.userId || orderData.customerDetails?.id;
          if (userId && userId !== 'anonymous') {
            try {
              const userData = await getUserById(userId);
              if (isMounted) setUser(userData);
            } catch (e) {
              console.warn('Could not load user details:', e);
            }
          }
          return;
        }
        
        // If not found in user or root orders, try anonymous orders
        const anonOrderRef = doc(db, 'anonymousOrders', orderId);
        const anonOrderSnap = await getDoc(anonOrderRef);
        
        if (anonOrderSnap.exists() && isMounted) {
          // Found in anonymous orders
          const orderData = anonOrderSnap.data();
          
          // Handle different possible item formats
          let items = [];
          if (orderData.items) {
            if (Array.isArray(orderData.items)) {
              items = orderData.items;
            } else if (typeof orderData.items === 'object') {
              // Handle object format {itemId1: {details}, itemId2: {details}}
              items = Object.values(orderData.items);
            }
          } else if (orderData.cartItems) {
            // Some orders might have items in cartItems
            items = Array.isArray(orderData.cartItems) 
              ? orderData.cartItems 
              : Object.values(orderData.cartItems);
          }
          
          // Ensure each item has required fields
          items = items.map(item => ({
            name: item.name || item.title || 'Unnamed Item',
            price: item.price || 0,
            quantity: item.quantity || 1,
            ...item
          }));
          
          setOrder({
            id: anonOrderSnap.id,
            ...orderData,
            items: items,
            isAnonymous: true, // Mark as anonymous order
            customerDetails: orderData.customerDetails || {
              email: orderData.email || 'Anonymous Customer',
              name: orderData.customerName || 'Anonymous Customer'
            },
            // Ensure we have a total
            total: orderData.total || orderData.amount || items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
          });
        } else if (isMounted) {
          setError('Order not found in any collection');
        }
      } catch (e) {
        console.error('Error loading order:', e);
        if (isMounted) {
          setError(e.message || 'Failed to load order');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    load();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [orderId, findUserWithOrder, fetchOrderFromUser]);

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
                {order.isAnonymous ? (
                  <Typography>Anonymous Customer</Typography>
                ) : user ? (
                  <Button component={RouterLink} to={`/users/${user.id || uid}`} size="small">
                    {user.name || user.email || 'View Customer'}
                  </Button>
                ) : (
                  <Typography>Guest Customer</Typography>
                )}
                {order.customerDetails?.email && (
                  <Typography variant="body2">{order.customerDetails.email}</Typography>
                )}
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
