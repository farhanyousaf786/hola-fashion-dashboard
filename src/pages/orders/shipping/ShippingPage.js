import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../../firebase/firebase';
import { doc, getDoc, collection, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import LabelManager from '../label_manager/LabelManager';
import './ShippingPage.css';

const API_BASE = process.env.NODE_ENV === 'production' ? '' : (process.env.REACT_APP_API_BASE || 'http://localhost:3001');

const defaultFromAddress = {
  name: 'Hola Fashion Warehouse',
  street1: '1 Hacker Way',
  city: 'Menlo Park',
  state: 'CA',
  zip: '94025',
  country: 'US',
  phone: '4155551234'
};

const defaultToAddress = {
  name: 'John Doe',
  street1: '965 Mission St',
  city: 'San Francisco',
  state: 'CA',
  zip: '94103',
  country: 'US',
  phone: '4155555678'
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
  const [to, setTo] = useState(defaultToAddress);
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
    if (orderId) {
      fetchOrder(orderId).then(orderData => {
        if (orderData) {
          setOrder(orderData);
          if (orderData.scope === 'user') setOwnerUserId(orderData.userId);
          
          // Auto-populate customer address if available
          if (orderData.customerDetails) {
            const customerAddr = {
              name: `${orderData.customerDetails.firstName || ''} ${orderData.customerDetails.lastName || ''}`.trim(),
              street1: orderData.customerDetails.address || '',
              city: orderData.customerDetails.city || '',
              state: orderData.customerDetails.state?.toUpperCase() || '',
              zip: orderData.customerDetails.zipCode || '',
              country: orderData.customerDetails.country || 'US',
              phone: orderData.customerDetails.phone || ''
            };
            
            // Only update if we have essential address fields
            if (customerAddr.street1 && customerAddr.city && customerAddr.state && customerAddr.zip) {
              setTo(customerAddr);
              console.log('Auto-populated customer address:', customerAddr);
            }
          }
        } else {
          setError('Order not found');
        }
        setLoading(false);
      });
    }
  }, [orderId, fetchOrder]);

  const handleChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };


  const fetchRates = async () => {
    setRatesLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      console.log('Fetching rates with data:', { from, to, parcel });
      
      const response = await fetch(`${API_BASE}/api/shippo/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, parcel })
      });

      const data = await response.json();
      console.log('Rates response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch rates');
      }

      setRates(data.rates || []);
      
      if (data.rates?.length === 0) {
        setErrorMsg('No shipping rates found. This could be due to invalid addresses, unsupported shipping routes, or parcel dimensions. Check the browser console for detailed logs.');
        console.warn('Shippo returned 0 rates. Full response:', data);
      } else {
        setSuccessMsg(`Found ${data.rates?.length || 0} shipping rates`);
      }
    } catch (err) {
      console.error('Fetch rates error:', err);
      setErrorMsg(err.message);
    } finally {
      setRatesLoading(false);
    }
  };

  const updateOrderTracking = async (tracking) => {
    try {
      // Remove undefined values to satisfy Firestore
      const clean = Object.fromEntries(
        Object.entries(tracking).filter(([_, v]) => v !== undefined)
      );
      // Common payload for all order locations
      const updates = {
        shipping: { ...(order.shipping || {}), ...clean },
        status: 'PROCESSING',
        labelPurchasedAt: serverTimestamp(),
      };
      if (order.scope === 'user' && ownerUserId) {
        const ref = doc(db, 'users', ownerUserId, 'orders', orderId);
        await updateDoc(ref, updates);
      } else if (order.scope === 'root') {
        const ref = doc(db, 'orders', orderId);
        await updateDoc(ref, updates);
      } else if (order.scope === 'anonymous') {
        const ref = doc(db, 'anonymousOrders', orderId);
        await updateDoc(ref, updates);
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
      if (!res.ok) {
        // Prefer detailed messages from backend (e.g., 422 with messages array)
        const detail = Array.isArray(data?.messages) && data.messages.length
          ? data.messages.join(', ')
          : (data?.error || 'Failed to purchase label');
        throw new Error(detail);
      }

      const tracking = {
        tracking_number: data.tracking_number || null,
        tracking_url: data.tracking_url_provider || null,
        carrier: data.carrier || rate.provider || null,
        servicelevel: data.servicelevel || (rate.servicelevel ? rate.servicelevel.name : null),
        label_url: data.label_url || null,
        amount: data.amount || rate.amount || null,
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
      <div className="shipping-container">
        <div className="shipping-content">
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'white' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 20px', width: '40px', height: '40px' }}></div>
            <p>Loading shipping details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shipping-container">
        <div className="shipping-content">
          <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
          <div className="alert alert-error" style={{ marginTop: '20px' }}>
            ❌ {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shipping-container">
      <div className="shipping-content">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back to Orders
        </button>

      <div className="shipping-header">
        <h1 className="shipping-title">
          🚚 Shipping for Order #{orderId?.substring(0, 8).toUpperCase()}
        </h1>
        <p className="shipping-subtitle">
          Order total: ${orderTotal.toFixed(2)}
        </p>
      </div>

      <div className="shipping-form">
        <div className="form-section">
          <h2 className="section-title">📦 From Address</h2>
          <div className="form-grid form-grid-2">
            <div className="input-group">
              <label className="input-label">Name</label>
              <input 
                className="form-input" 
                name="name" 
                value={from.name} 
                onChange={handleChange(setFrom)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Street 1</label>
              <input 
                className="form-input" 
                name="street1" 
                value={from.street1} 
                onChange={handleChange(setFrom)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Street 2</label>
              <input 
                className="form-input" 
                name="street2" 
                value={from.street2 || ''} 
                onChange={handleChange(setFrom)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">City</label>
              <input 
                className="form-input" 
                name="city" 
                value={from.city} 
                onChange={handleChange(setFrom)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">State</label>
              <input 
                className="form-input" 
                name="state" 
                value={from.state} 
                onChange={handleChange(setFrom)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">ZIP</label>
              <input 
                className="form-input" 
                name="zip" 
                value={from.zip} 
                onChange={handleChange(setFrom)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Country</label>
              <input 
                className="form-input" 
                name="country" 
                value={from.country} 
                onChange={handleChange(setFrom)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Phone</label>
              <input 
                className="form-input" 
                name="phone" 
                value={from.phone || ''} 
                onChange={handleChange(setFrom)} 
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">📍 To Address</h2>
          <div className="form-grid form-grid-2">
            <div className="input-group">
              <label className="input-label">Name</label>
              <input 
                className="form-input" 
                name="name" 
                value={to.name} 
                onChange={handleChange(setTo)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Street 1</label>
              <input 
                className="form-input" 
                name="street1" 
                value={to.street1} 
                onChange={handleChange(setTo)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Street 2</label>
              <input 
                className="form-input" 
                name="street2" 
                value={to.street2 || ''} 
                onChange={handleChange(setTo)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">City</label>
              <input 
                className="form-input" 
                name="city" 
                value={to.city} 
                onChange={handleChange(setTo)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">State</label>
              <input 
                className="form-input" 
                name="state" 
                value={to.state} 
                onChange={handleChange(setTo)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">ZIP</label>
              <input 
                className="form-input" 
                name="zip" 
                value={to.zip} 
                onChange={handleChange(setTo)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Country</label>
              <input 
                className="form-input" 
                name="country" 
                value={to.country} 
                onChange={handleChange(setTo)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Phone</label>
              <input 
                className="form-input" 
                name="phone" 
                value={to.phone || ''} 
                onChange={handleChange(setTo)} 
              />
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="form-section">
          <h2 className="section-title">📏 Parcel Details</h2>
          <div className="form-grid form-grid-4">
            <div className="input-group">
              <label className="input-label">Length</label>
              <input 
                className="form-input" 
                name="length" 
                value={parcel.length} 
                onChange={handleChange(setParcel)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Width</label>
              <input 
                className="form-input" 
                name="width" 
                value={parcel.width} 
                onChange={handleChange(setParcel)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Height</label>
              <input 
                className="form-input" 
                name="height" 
                value={parcel.height} 
                onChange={handleChange(setParcel)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Weight</label>
              <input 
                className="form-input" 
                name="weight" 
                value={parcel.weight} 
                onChange={handleChange(setParcel)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Distance Unit</label>
              <select 
                className="form-select" 
                name="distance_unit" 
                value={parcel.distance_unit} 
                onChange={handleChange(setParcel)}
              >
                <option value="in">in</option>
                <option value="cm">cm</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Mass Unit</label>
              <select 
                className="form-select" 
                name="mass_unit" 
                value={parcel.mass_unit} 
                onChange={handleChange(setParcel)}
              >
                <option value="lb">lb</option>
                <option value="oz">oz</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">⚡ Actions</h2>
          <div className="actions-section">
            <button 
              className="btn btn-primary" 
              onClick={fetchRates} 
              disabled={ratesLoading}
            >
              {ratesLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Fetching Rates...
                </>
              ) : (
                <>
                  🔍 Get Rates
                </>
              )}
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="alert alert-success">
            ✅ {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-error">
            ❌ {errorMsg}
          </div>
        )}
      </div>

      {rates.length > 0 && (
        <div className="rates-section">
          <h2 className="rates-title">🚛 Available Shipping Rates</h2>
          <div className="rates-grid">
            {rates.map((rate) => (
              <div key={rate.object_id || rate.objectId || rate.id}>
                <LabelManager 
                  rate={rate} 
                  orderId={orderId}
                  onLabelPurchased={(labelInfo) => {
                    updateOrderTracking(labelInfo);
                    setSuccessMsg(`Label purchased! Tracking: ${labelInfo.tracking_number}`);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ShippingPage;
