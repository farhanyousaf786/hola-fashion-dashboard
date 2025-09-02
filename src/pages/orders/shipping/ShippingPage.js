import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Button, Paper, Grid, TextField, MenuItem, CircularProgress, Alert, Divider } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { db } from '../../../firebase/firebase';
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';

const API_BASE = process.env.NODE_ENV === 'production' ? '' : (process.env.REACT_APP_API_BASE || 'http://localhost:3001');

const defaultFromAddress = {
  name: 'Warehouse',
  street1: '123 Main St',
  city: 'Anytown',
  state: 'CA',
  zip: '94016',
  country: 'US',
  phone: ''
};

const defaultParcel = {
  length: '12',
  width: '8',
  height: '4',
  distance_unit: 'in',
  weight: '2',
  mass_unit: 'lb'
};

const ShippingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [ownerUserId, setOwnerUserId] = useState(null);

  const [from, setFrom] = useState(defaultFromAddress);
  const [to, setTo] = useState({ ...defaultFromAddress, name: '', phone: '' });
  const [parcel, setParcel] = useState(defaultParcel);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [rates, setRates] = useState([]);
  const [buying, setBuying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const orderTotal = useMemo(() => {
    if (!order?.items?.length) return 0;
    return order.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  }, [order]);

  // Helpers to find order owner and fetch order (similar to OrderDetail.js)
  const findUserWithOrder = React.useCallback(async (oid) => {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      for (const userDoc of usersSnapshot.docs) {
        const orderRef = doc(db, 'users', userDoc.id, 'orders', oid);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) return userDoc.id;
      }
    } catch (e) {
      console.warn('findUserWithOrder error', e);
    }
    return null;
  }, []);

  const fetchOrder = React.useCallback(async (oid) => {
    // 1) try user collections
    const userId = await findUserWithOrder(oid);
    if (userId) {
      const ref = doc(db, 'users', userId, 'orders', oid);
      const snap = await getDoc(ref);
      if (snap.exists()) return { scope: 'user', userId, id: snap.id, ...snap.data() };
    }
    // 2) root orders
    const rootRef = doc(db, 'orders', oid);
    const rootSnap = await getDoc(rootRef);
    if (rootSnap.exists()) return { scope: 'root', id: rootSnap.id, ...rootSnap.data() };
    // 3) anonymous
    const anonRef = doc(db, 'anonymousOrders', oid);
    const anonSnap = await getDoc(anonRef);
    if (anonSnap.exists()) return { scope: 'anonymous', id: anonSnap.id, ...anonSnap.data() };
    return null;
  }, [findUserWithOrder]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchOrder(orderId);
        if (!mounted) return;
        if (!data) {
          setError('Order not found');
          return;
        }
        setOrder(data);
        setOwnerUserId(data.userId || (data.scope === 'user' ? data.userId : null));
        // Seed destination from order.shipping if present
        const s = data.shipping || {};
        setTo({
          name: s.name || data.customerDetails?.name || 'Customer',
          street1: s.address1 || s.address || '',
          street2: s.address2 || '',
          city: s.city || '',
          state: s.state || s.region || '',
          zip: s.postalCode || s.zip || '',
          country: s.country || 'US',
          phone: s.phone || data.customerDetails?.phone || ''
        });
      } catch (e) {
        if (!mounted) return;
        setError(e.message || 'Failed to load order');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [orderId, fetchOrder]);

  const handleChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const testConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/test`);
      const data = await response.json();
      setSuccessMsg(`✅ Connection test successful: ${data.message}`);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(`❌ Connection test failed: ${err.message}`);
      setSuccessMsg('');
    }
  };

  const fetchRates = async () => {
    setRatesLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${API_BASE}/api/shippo/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, parcel })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch rates');
      }

      setRates(data.rates || []);
      setSuccessMsg(`Found ${data.rates?.length || 0} shipping rates`);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setRatesLoading(false);
    }
  };

  const updateOrderTracking = async (tracking) => {
    try {
      if (order.scope === 'user' && ownerUserId) {
        const ref = doc(db, 'users', ownerUserId, 'orders', orderId);
        await updateDoc(ref, { shipping: { ...(order.shipping || {}), ...tracking } });
      } else if (order.scope === 'root') {
        const ref = doc(db, 'orders', orderId);
        await updateDoc(ref, { shipping: { ...(order.shipping || {}), ...tracking } });
      } else if (order.scope === 'anonymous') {
        const ref = doc(db, 'anonymousOrders', orderId);
        await updateDoc(ref, { shipping: { ...(order.shipping || {}), ...tracking } });
      }
    } catch (e) {
      console.warn('Failed to persist tracking info:', e);
    }
  };

  const buyLabel = async (rate) => {
    setBuying(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/shippo/label`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate_id: rate.object_id || rate.objectId || rate.object || rate.id || rate })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to purchase label');

      const tracking = {
        tracking_number: data.tracking_number,
        tracking_url: data.tracking_url_provider,
        carrier: data.carrier,
        servicelevel: data.servicelevel,
        label_url: data.label_url
      };
      await updateOrderTracking(tracking);
      setSuccessMsg(`Label purchased. Tracking #${data.tracking_number}`);
      // Optionally open label
      if (data.label_url) window.open(data.label_url, '_blank');
    } catch (e) {
      setError(e.message);
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 900, m: '0 auto' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, margin: '0 auto' }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back to Order
      </Button>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <LocalShippingIcon color="primary" />
          <Typography variant="h5" component="h1">
            Shipping for Order #{orderId}
          </Typography>
        </Box>

        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Order total: ${orderTotal.toFixed(2)}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>From Address</Typography>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <TextField size="small" fullWidth label="Name" name="name" value={from.name} onChange={handleChange(setFrom)} />
              </Grid>
              <Grid item xs={12}>
                <TextField size="small" fullWidth label="Street 1" name="street1" value={from.street1} onChange={handleChange(setFrom)} />
              </Grid>
              <Grid item xs={12}>
                <TextField size="small" fullWidth label="Street 2" name="street2" value={from.street2 || ''} onChange={handleChange(setFrom)} />
              </Grid>
              <Grid item xs={6}>
                <TextField size="small" fullWidth label="City" name="city" value={from.city} onChange={handleChange(setFrom)} />
              </Grid>
              <Grid item xs={3}>
                <TextField size="small" fullWidth label="State" name="state" value={from.state} onChange={handleChange(setFrom)} />
              </Grid>
              <Grid item xs={3}>
                <TextField size="small" fullWidth label="ZIP" name="zip" value={from.zip} onChange={handleChange(setFrom)} />
              </Grid>
              <Grid item xs={6}>
                <TextField size="small" fullWidth label="Country" name="country" value={from.country} onChange={handleChange(setFrom)} />
              </Grid>
              <Grid item xs={6}>
                <TextField size="small" fullWidth label="Phone" name="phone" value={from.phone || ''} onChange={handleChange(setFrom)} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>To Address</Typography>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <TextField size="small" fullWidth label="Name" name="name" value={to.name} onChange={handleChange(setTo)} />
              </Grid>
              <Grid item xs={12}>
                <TextField size="small" fullWidth label="Street 1" name="street1" value={to.street1} onChange={handleChange(setTo)} />
              </Grid>
              <Grid item xs={12}>
                <TextField size="small" fullWidth label="Street 2" name="street2" value={to.street2 || ''} onChange={handleChange(setTo)} />
              </Grid>
              <Grid item xs={6}>
                <TextField size="small" fullWidth label="City" name="city" value={to.city} onChange={handleChange(setTo)} />
              </Grid>
              <Grid item xs={3}>
                <TextField size="small" fullWidth label="State" name="state" value={to.state} onChange={handleChange(setTo)} />
              </Grid>
              <Grid item xs={3}>
                <TextField size="small" fullWidth label="ZIP" name="zip" value={to.zip} onChange={handleChange(setTo)} />
              </Grid>
              <Grid item xs={6}>
                <TextField size="small" fullWidth label="Country" name="country" value={to.country} onChange={handleChange(setTo)} />
              </Grid>
              <Grid item xs={6}>
                <TextField size="small" fullWidth label="Phone" name="phone" value={to.phone || ''} onChange={handleChange(setTo)} />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Parcel</Typography>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <TextField size="small" fullWidth label="Length" name="length" value={parcel.length} onChange={handleChange(setParcel)} />
              </Grid>
              <Grid item xs={4}>
                <TextField size="small" fullWidth label="Width" name="width" value={parcel.width} onChange={handleChange(setParcel)} />
              </Grid>
              <Grid item xs={4}>
                <TextField size="small" fullWidth label="Height" name="height" value={parcel.height} onChange={handleChange(setParcel)} />
              </Grid>
              <Grid item xs={6}>
                <TextField select size="small" fullWidth label="Distance Unit" name="distance_unit" value={parcel.distance_unit} onChange={handleChange(setParcel)}>
                  <MenuItem value="in">in</MenuItem>
                  <MenuItem value="cm">cm</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField size="small" fullWidth label="Weight" name="weight" value={parcel.weight} onChange={handleChange(setParcel)} />
              </Grid>
              <Grid item xs={3}>
                <TextField select size="small" fullWidth label="Mass Unit" name="mass_unit" value={parcel.mass_unit} onChange={handleChange(setParcel)}>
                  <MenuItem value="lb">lb</MenuItem>
                  <MenuItem value="oz">oz</MenuItem>
                  <MenuItem value="g">g</MenuItem>
                  <MenuItem value="kg">kg</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Actions</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button variant="outlined" onClick={testConnection}>
                Test API
              </Button>
              <Button variant="contained" startIcon={<SearchIcon />} onClick={fetchRates} disabled={ratesLoading}>
                {ratesLoading ? 'Fetching Rates...' : 'Get Rates'}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {successMsg && (
          <Alert sx={{ mt: 2 }} severity="success">{successMsg}</Alert>
        )}

        {errorMsg && (
          <Alert sx={{ mt: 2 }} severity="error">{errorMsg}</Alert>
        )}

        {rates.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Available Rates
            </Typography>
            <Grid container spacing={2}>
              {rates.map((r) => (
                <Grid item xs={12} md={6} key={r.object_id || r.objectId || r.id}>
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography fontWeight={600}>{r.provider} - {r.servicelevel?.name || r.servicelevel_name}</Typography>
                      <Typography variant="body2" color="text.secondary">Est. days: {r.estimated_days ?? 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6">${parseFloat(r.amount).toFixed(2)}</Typography>
                      <Button size="small" variant="contained" color="primary" startIcon={<ReceiptLongIcon />} onClick={() => buyLabel(r)} disabled={buying}>
                        {buying ? 'Purchasing...' : 'Buy Label'}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ShippingPage;
