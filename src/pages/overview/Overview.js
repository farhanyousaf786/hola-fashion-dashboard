import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';


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

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Orders Overview
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {/* Metrics Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Paper elevation={2} className="summaryCard">
                <Typography variant="subtitle1">Total Orders</Typography>
                <Typography variant="h5">{totalOrders}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={3}>
              <Paper elevation={2} className="summaryCard">
                <Typography variant="subtitle1">Total Revenue</Typography>
                <Typography variant="h5">${totalRevenue.toFixed(2)}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={3}>
              <Paper elevation={2} className="summaryCard">
                <Typography variant="subtitle1">Average Order Value</Typography>
                <Typography variant="h5">${avgOrderValue}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={3}>
              <Paper elevation={2} className="summaryCard">
                <Typography variant="subtitle1">Orders by Status</Typography>
                {Object.keys(statusCounts).map((status) => (
                  <Chip
                    key={status}
                    label={`${status}: ${statusCounts[status]}`}
                    sx={{ m: 0.5 }}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Paper>
            </Grid>
          </Grid>

          {/* Latest Orders Table */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Latest Orders
            </Typography>
            <Paper elevation={1}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {latestOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id.slice(0, 8).toUpperCase()}</TableCell>
                      <TableCell>
                        {order.isAnonymous ? (
                          <>
                            Anonymous order{' '}
                            <Chip size="small" label="Anonymous" variant="outlined" sx={{ ml: 1 }} />
                          </>
                        ) : (
                          order.customerDetails?.email || 'Guest'
                        )}
                      </TableCell>
                      <TableCell>
                        {order.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color="default"
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>${order.total?.toFixed(2) || '0.00'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Overview;
