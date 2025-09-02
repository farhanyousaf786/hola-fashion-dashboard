import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import './Overview.css';
const Overview = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all orders (same as in Orders.js)
  useEffect(() => {
    const fetchAllOrders = async () => {
      const ordersList = [];

      // 1. Root orders
      const rootOrdersRef = collection(db, 'orders');
      const rootSnapshot = await getDocs(query(rootOrdersRef, orderBy('createdAt', 'desc')));
      rootSnapshot.forEach(doc => {
        const data = doc.data();
        ordersList.push({ id: doc.id, ...data });
      });

      // 2. User orders
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      for (const userDoc of usersSnapshot.docs) {
        const userOrdersRef = collection(db, 'users', userDoc.id, 'orders');
        const userOrdersSnapshot = await getDocs(userOrdersRef);
        userOrdersSnapshot.forEach(orderDoc => {
          const data = orderDoc.data();
          ordersList.push({ id: orderDoc.id, ...data });
        });
      }

      // 3. Anonymous orders (root collection where each doc is an order)
      const anonRef = collection(db, 'anonymousOrders');
      const anonSnapshot = await getDocs(anonRef);
      anonSnapshot.forEach(docSnap => {
        const data = docSnap.data();
        ordersList.push({ id: docSnap.id, ...data, isAnonymous: true });
      });

      setOrders(ordersList);
      setLoading(false);
    };

    fetchAllOrders();
  }, []);

  // === Metrics Calculations ===
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

  const statusCounts = orders.reduce((acc, order) => {
    const status = order.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const latestOrders = [...orders]
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    })
    .slice(0, 5);

  // Helpers
  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const currency = (n) => {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(n || 0));
    } catch {
      const num = Number(n || 0).toFixed(2);
      return `$${num}`;
    }
  };

  return (
    <div className="overview-container">
      <div className="overview-content">
        <div className="overview-header">
          <h1>Orders Overview</h1>
          <p className="muted">A quick snapshot of your store performance</p>
        </div>

        {loading ? (
          <div className="loading">
            <div className="loading-spinner" />
          </div>
        ) : (
          <>
            {/* Metrics */}
            <div className="metrics-grid">
              <div className="metric-card summaryCard">
                <div className="metric-label">Total Orders</div>
                <div className="metric-value">{totalOrders}</div>
              </div>
              <div className="metric-card summaryCard">
                <div className="metric-label">Total Revenue</div>
                <div className="metric-value">{currency(totalRevenue)}</div>
              </div>
              <div className="metric-card summaryCard">
                <div className="metric-label">Avg. Order Value</div>
                <div className="metric-value">{currency(avgOrderValue)}</div>
              </div>
              <div className="metric-card summaryCard">
                <div className="metric-label">Orders by Status</div>
                <div className="status-list">
                  {Object.keys(statusCounts).map((status) => (
                    <span key={status} className={`status-chip ${`status-${status.toLowerCase()}`}`}>
                      {status}: {statusCounts[status]}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Latest Orders */}
            <div className="section">
              <div className="section-title">Latest Orders</div>
              <div className="table-card">
                <table className="latest-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id.slice(0, 8).toUpperCase()}</td>
                        <td>
                          {order.isAnonymous ? (
                            <span className="badge badge-outline">Anonymous</span>
                          ) : (
                            order.customerDetails?.email || 'Guest'
                          )}
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <span className={`status-badge ${order.status?.toLowerCase() || 'unknown'}`}>
                            {order.status || 'unknown'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>{currency(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Overview;
