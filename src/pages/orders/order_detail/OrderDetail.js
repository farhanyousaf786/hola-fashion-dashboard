import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { getUserById } from '../../../firebase/services/userService';
import './OrderDetail.css';

// Helper functions
const getStatusClass = (status) => {
  const statusLower = status?.toLowerCase();
  if (statusLower === 'completed') return 'status-completed';
  if (statusLower === 'cancelled') return 'status-cancelled';
  return 'status-pending';
};

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
      if (uid && uid !== 'anonymous') {
        return uid;
      }
      
      console.log('Searching for order in user collections...');
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
  }, [uid]);

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
    
    const loadOrderData = async () => {
      try {
        setLoading(true);
        setError('');

        // Try to find the user who has this order
        const userId = await findUserWithOrder(orderId);
        
        if (!isMounted) return;

        if (userId) {
          // Fetch order from user's collection
          const orderData = await fetchOrderFromUser(userId);
          
          if (!isMounted) return;

          if (orderData) {
            setOrder(orderData);
            
            // Fetch user details
            try {
              const userData = await getUserById(userId);
              if (isMounted && userData) {
                setUser(userData);
              }
            } catch (userError) {
              console.warn('Error fetching user details:', userError);
            }
          } else {
            setError('Order not found in user collection');
          }
        } else {
          // Try to fetch from root orders collection
          try {
            const rootOrderRef = doc(db, 'orders', orderId);
            const rootOrderSnap = await getDoc(rootOrderRef);
            
            if (!isMounted) return;

            if (rootOrderSnap.exists()) {
              const orderData = rootOrderSnap.data();
              setOrder({
                id: rootOrderSnap.id,
                ...orderData,
                items: orderData.items ? (Array.isArray(orderData.items) ? orderData.items : Object.values(orderData.items)) : [],
                status: orderData.status || 'pending',
                total: orderData.total || 0,
                amount: orderData.amount || 0,
                createdAt: orderData.createdAt || orderData.timestamp || new Date()
              });
            } else {
              // Try anonymous orders
              const anonOrderRef = doc(db, 'anonymousOrders', orderId);
              const anonOrderSnap = await getDoc(anonOrderRef);
              
              if (!isMounted) return;

              if (anonOrderSnap.exists()) {
                const orderData = anonOrderSnap.data();
                setOrder({
                  id: anonOrderSnap.id,
                  ...orderData,
                  items: orderData.items ? (Array.isArray(orderData.items) ? orderData.items : Object.values(orderData.items)) : [],
                  status: orderData.status || 'pending',
                  total: orderData.total || 0,
                  amount: orderData.amount || 0,
                  createdAt: orderData.createdAt || orderData.timestamp || new Date()
                });
              } else {
                setError('Order not found');
              }
            }
          } catch (rootError) {
            console.error('Error fetching from root collections:', rootError);
            setError('Error loading order data');
          }
        }
      } catch (error) {
        console.error('Error in loadOrderData:', error);
        if (isMounted) {
          setError('Failed to load order data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrderData();

    return () => {
      isMounted = false;
    };
  }, [orderId, findUserWithOrder, fetchOrderFromUser]);

  // Calculate order total
  const orderTotal = React.useMemo(() => {
    if (!order?.items?.length) return order?.total || order?.amount || 0;
    return order.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  }, [order]);

  if (loading) {
    return (
      <div className="order-detail-container">
        <div className="order-detail-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p style={{ color: 'white', marginTop: '20px' }}>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-container">
        <div className="order-detail-content">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="error-message">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-container">
        <div className="order-detail-content">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="error-message">
            Order not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-container">
      <div className="order-detail-content">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back to Orders
        </button>

      

        {/* Order Header */}
        <div className="order-header">
          <div className="order-title">
            🛍️ Order #{orderId?.substring(0, 8).toUpperCase()}
          </div>
          <div className="order-subtitle">
            Placed on {formatDate(order.createdAt)}
          </div>
            {/* Top Actions */}
        <div className="top-actions">
          <button
            className="btn btn-primary btn-primary--blue"
            onClick={() => navigate(`/orders/${orderId}/shipping`)}
          >
            🚚 Manage Shipping
          </button>
        </div>
          <div className="order-meta">
            <div className={`status-chip ${getStatusClass(order.status)}`}>
              {order.status || 'pending'}
            </div>
            
            <div className="order-total">
              <div className="total-amount">{currency(orderTotal)}</div>
              <div className="total-items">{order.items?.length || 0} items</div>
            </div>
            
          </div>
        </div>

        <div className="order-content">
          {/* Order Items Section */}
          <div className="section-card">
            <div className="section-title">
              📦 Order Items
            </div>
            
            <table className="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(order.items) && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="product-info">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name || 'Product'} 
                              className="product-image"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/60?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="product-image" style={{ 
                              background: '#f8f9fa', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontSize: '12px',
                              color: '#999'
                            }}>
                              📷
                            </div>
                          )}
                          <div className="product-details">
                            <h4>{item.name || 'Unnamed Product'}</h4>
                            {item.sku && <p>SKU: {item.sku}</p>}
                            {item.variant && <p>{item.variant}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="price-cell">
                        {currency(item.price || 0)}
                      </td>
                      <td className="quantity-cell">
                        {item.quantity || 1}
                      </td>
                      <td className="price-cell">
                        {currency((item.price || 0) * (item.quantity || 1))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      No items found in this order
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Customer & Shipping Info */}
          <div>
            {/* Customer Information */}
            <div className="section-card">
              <div className="section-title">
                👤 Customer Information
              </div>
              
              <div className="customer-info">
                <div className="info-row">
                  <div className="info-icon">👤</div>
                  <div className="info-content">
                    <div className="info-label">Customer</div>
                    <div className="info-value">
                      {order.customerDetails?.firstName && order.customerDetails?.lastName 
                        ? `${order.customerDetails.firstName} ${order.customerDetails.lastName}`
                        : order.customerDetails?.email || order.customer || 'Unknown Customer'
                      }
                    </div>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-icon">📧</div>
                  <div className="info-content">
                    <div className="info-label">Email</div>
                    <div className="info-value">
                      {order.customerDetails?.email || order.customer || 'Not provided'}
                    </div>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-icon">📱</div>
                  <div className="info-content">
                    <div className="info-label">Phone</div>
                    <div className="info-value">
                      {order.customerDetails?.phone || 'Not provided'}
                    </div>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-icon">📍</div>
                  <div className="info-content">
                    <div className="info-label">Address</div>
                    <div className="info-value address-text">
                      {order.customerDetails?.address ? (
                        <>
                          {order.customerDetails.address}<br />
                          {order.customerDetails.city && `${order.customerDetails.city}, `}
                          {order.customerDetails.state} {order.customerDetails.zipCode}<br />
                          {order.customerDetails.country || 'US'}
                        </>
                      ) : (
                        'Not provided'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            {order.shipping && (
              <div className="section-card">
                <div className="section-title">
                  🚚 Shipping Information
                </div>
                
                <div className="shipping-info">
                  {order.shipping.tracking_number && (
                    <div className="shipping-row">
                      <div className="shipping-label">Tracking Number</div>
                      <div className="shipping-value">
                        {order.shipping.tracking_url ? (
                          <a 
                            href={order.shipping.tracking_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="tracking-link"
                          >
                            {order.shipping.tracking_number}
                          </a>
                        ) : (
                          order.shipping.tracking_number
                        )}
                      </div>
                    </div>
                  )}
                  
                  {order.shipping.carrier && (
                    <div className="shipping-row">
                      <div className="shipping-label">Carrier</div>
                      <div className="shipping-value">{order.shipping.carrier}</div>
                    </div>
                  )}
                  
                  {order.shipping.servicelevel && (
                    <div className="shipping-row">
                      <div className="shipping-label">Service Level</div>
                      <div className="shipping-value">{order.shipping.servicelevel}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons - moved Manage Shipping to top; Print removed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
