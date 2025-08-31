import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { getUserById } from '../../../firebase/services/userService';
import {
  Box,
  Typography,
  Button,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  styled,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Receipt as ReceiptIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Image as ImageIcon
} from '@mui/icons-material';

// Styled components
const StatusChip = styled(Chip)(({ theme, status }) => ({
  textTransform: 'capitalize',
  fontWeight: 600,
  backgroundColor: status === 'completed' 
    ? theme.palette.success.light 
    : status === 'cancelled' 
      ? theme.palette.error.light 
      : theme.palette.warning.light,
  color: theme.palette.getContrastText(
    status === 'completed' 
      ? theme.palette.success.light 
      : status === 'cancelled' 
        ? theme.palette.error.light 
        : theme.palette.warning.light
  ),
}));

const OrderCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
    transition: 'all 0.3s ease-in-out',
  },
  transition: 'all 0.3s ease-in-out',
}));

const ProductImage = styled('img')({
  width: 80,
  height: 80,
  objectFit: 'cover',
  borderRadius: 8,
  border: '1px solid #eee',
});

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
  },
}));

const InfoRow = ({ icon: Icon, label, value }) => (
  <Box sx={{ display: 'flex', mb: 1.5, alignItems: 'flex-start' }}>
    <Icon color="action" sx={{ mr: 1.5, mt: 0.5, flexShrink: 0 }} />
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2">{value || '-'}</Typography>
    </Box>
  </Box>
);

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

  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress />
        <Typography color="text.secondary">Loading order details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Order not found</Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  // Calculate order total
  const orderTotal = order.total || order.amount || 
    (Array.isArray(order.items) ? 
      order.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) : 0);

  // Format address
  const formatAddress = (shipping) => {
    if (!shipping) return 'No shipping address provided';
    if (shipping.address) return shipping.address;
    
    const { address1, address2, city, state, postalCode, country } = shipping;
    return [
      address1,
      address2,
      [city, state, postalCode].filter(Boolean).join(', '),
      country
    ].filter(Boolean).join('\n');
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 1400, margin: '0 auto' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ textTransform: 'none' }}
        >
          Back to Orders
        </Button>
      </Box>

      <OrderCard>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                Order #{order.id?.substring(0, 8).toUpperCase()}
              </Typography>
              {order.status && (
                <StatusChip 
                  label={order.status} 
                  status={order.status.toLowerCase()} 
                />
              )}
            </Box>
          }
          subheader={`Placed on ${formatDate(order.createdAt)}`}
          action={
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600, textAlign: 'right' }}>
                {currency(orderTotal)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
                {order.items?.length || 0} items
              </Typography>
            </Box>
          }
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            '& .MuiCardHeader-action': {
              alignSelf: 'center',
              margin: 0,
            },
          }}
        />
        <CardContent>

          <Grid container spacing={4}>
            {/* Order Items Section */}
            <Grid item xs={12} lg={8}>
              <SectionTitle variant="h6">
                <ReceiptIcon /> Order Items
              </SectionTitle>
              
              <TableContainer component={Paper} elevation={0} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="center">Qty</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(order.items) && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {item.image ? (
                                <ProductImage 
                                  src={item.image} 
                                  alt={item.name || 'Product'} 
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                                  }}
                                />
                              ) : (
                                <Box sx={{ 
                                  width: 80, 
                                  height: 80, 
                                  bgcolor: 'grey.100',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 1
                                }}>
                                  <ImageIcon color="disabled" />
                                </Box>
                              )}
                              <Box>
                                <Typography variant="subtitle2">
                                  {item.name || 'Unnamed Product'}
                                </Typography>
                                {item.sku && (
                                  <Typography variant="caption" color="text.secondary">
                                    SKU: {item.sku}
                                  </Typography>
                                )}
                                {item.variant && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {item.variant}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {currency(item.price || 0)}
                          </TableCell>
                          <TableCell align="center">
                            {item.quantity || 1}
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={500}>
                              {currency((item.price || 0) * (item.quantity || 1))}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">No items in this order</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Order Notes */}
              {order.notes && (
                <Box sx={{ mt: 3 }}>
                  <SectionTitle variant="h6">
                    <EditIcon fontSize="small" /> Order Notes
                  </SectionTitle>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2" whiteSpace="pre-line">
                      {order.notes}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Grid>

            {/* Order Summary Section */}
            <Grid item xs={12} lg={4}>
              <Box sx={{ position: 'sticky', top: 20 }}>
                {/* Customer Information */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <SectionTitle variant="subtitle1">
                      <PersonIcon fontSize="small" /> Customer
                    </SectionTitle>
                    
                    {order.isAnonymous ? (
                      <Typography>Guest Checkout</Typography>
                    ) : user ? (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <Avatar 
                            src={user.photoURL} 
                            sx={{ width: 40, height: 40, mr: 1.5 }}
                          >
                            {user.name?.[0] || user.email?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {user.name || 'Customer'}
                            </Typography>
                            {user.email && (
                              <Typography variant="body2" color="text.secondary">
                                {user.email}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        
                        <Box sx={{ ml: 5.5 }}>
                          {user.phoneNumber && (
                            <InfoRow 
                              icon={PhoneIcon} 
                              label="Phone" 
                              value={user.phoneNumber} 
                            />
                          )}
                          {order.customerDetails?.phone && !user.phoneNumber && (
                            <InfoRow 
                              icon={PhoneIcon} 
                              label="Phone" 
                              value={order.customerDetails.phone} 
                            />
                          )}
                        </Box>
                      </Box>
                    ) : (
                      <Typography>Guest Customer</Typography>
                    )}
                  </CardContent>
                </Card>

                {/* Shipping Information */}
                {order.shipping && (
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <SectionTitle variant="subtitle1">
                        <ShippingIcon fontSize="small" /> Shipping Information
                      </SectionTitle>
                      
                      <InfoRow 
                        icon={LocationIcon} 
                        label="Address" 
                        value={formatAddress(order.shipping)} 
                      />
                      
                      {order.shipping.phone && (
                        <InfoRow 
                          icon={PhoneIcon} 
                          label="Contact" 
                          value={order.shipping.phone} 
                        />
                      )}
                      
                      {order.shipping.tracking_number && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Tracking Information
                          </Typography>
                          <InfoRow 
                            icon={ShippingIcon} 
                            label="Carrier" 
                            value={order.shipping.carrier || 'Standard'} 
                          />
                          <Box sx={{ mt: 1 }}>
                            <Button
                              fullWidth
                              variant="outlined"
                              size="small"
                              href={`https://www.google.com/search?q=track+${order.shipping.tracking_number}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              startIcon={<SearchIcon />}
                            >
                              Track #{order.shipping.tracking_number}
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Order Summary */}
                <Card variant="outlined">
                  <CardContent>
                    <SectionTitle variant="subtitle1">
                      <ReceiptIcon fontSize="small" /> Order Summary
                    </SectionTitle>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Subtotal
                        </Typography>
                        <Typography variant="body2">
                          {currency(orderTotal - (order.shipping?.price || 0))}
                        </Typography>
                      </Box>
                      
                      {order.shipping?.price > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Shipping
                          </Typography>
                          <Typography variant="body2">
                            {currency(order.shipping.price)}
                          </Typography>
                        </Box>
                      )}
                      
                      {order.discount > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Discount
                          </Typography>
                          <Typography variant="body2" color="error">
                            -{currency(order.discount)}
                          </Typography>
                        </Box>
                      )}
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Total
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {currency(orderTotal)}
                        </Typography>
                      </Box>
                      
                      {order.paymentMethod && (
                        <Box sx={{ 
                          mt: 2, 
                          p: 1.5, 
                          bgcolor: 'success.light',
                          color: 'success.contrastText',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <PaymentIcon fontSize="small" />
                          <Typography variant="body2">
                            Paid with {order.paymentMethod}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ p: 2, justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Button 
            variant="contained"
            color="primary"
            startIcon={<ShippingIcon />}
            onClick={() => navigate(`/orders/${orderId}/shipping`)}
          >
            Manage Shipping
          </Button>
        </CardActions>
      </OrderCard>
    </Box>
  );
};

export default OrderDetail;
