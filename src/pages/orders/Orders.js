import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';
import './Orders.css';

import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';

// Status options
const statusOptions = [
  { value: 'confirmed', label: 'Confirmed', color: 'info' },
  { value: 'processing', label: 'Processing', color: 'warning' },
  { value: 'shipped', label: 'Shipped', color: 'primary' },
  { value: 'delivered', label: 'Delivered', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'error' },
];

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  // Fetch all orders from Firebase
  useEffect(() => {
    const fetchAllOrders = async () => {
      console.log('=== FETCHING ALL ORDERS ===');
      setLoading(true);
      const ordersList = [];

      // 1. Get all orders from root 'orders' collection
      try {
        console.log('Fetching from root orders collection...');
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        console.log(`Found ${querySnapshot.size} orders in root collection`);
        
        querySnapshot.forEach((doc) => {
          try {
            const data = doc.data();
            const orderDate = data.createdAt?.toDate?.();
            ordersList.push({
              id: doc.id,
              ...data,
              date: orderDate ? orderDate.toLocaleDateString() : 'N/A',
              customer: data.customerDetails?.email || 'Guest User',
              total: data.total || 0,
              status: data.status || 'pending',
              source: 'root_orders'
            });
          } catch (error) {
            console.error('Error processing order:', error);
          }
        });
      } catch (error) {
        console.error('Error fetching root orders:', error);
      }

      // 2. Get all user orders
      try {
        console.log('Fetching all user orders...');
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        
        for (const userDoc of usersSnapshot.docs) {
          const userOrdersRef = collection(db, 'users', userDoc.id, 'orders');
          const userOrdersQuery = query(userOrdersRef, orderBy('createdAt', 'desc'));
          const userOrdersSnapshot = await getDocs(userOrdersQuery);
          
          userOrdersSnapshot.forEach((orderDoc) => {
            try {
              const data = orderDoc.data();
              const orderDate = data.createdAt?.toDate?.();
              ordersList.push({
                id: orderDoc.id,
                ...data,
                date: orderDate ? orderDate.toLocaleDateString() : 'N/A',
                customer: data.customerDetails?.email || `User ${userDoc.id.substring(0, 6)}`,
                total: data.total || 0,
                status: data.status || 'pending',
                userId: userDoc.id,
                source: `user_${userDoc.id}`
              });
            } catch (error) {
              console.error('Error processing user order:', error);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching user orders:', error);
      }

      // 3. Get all anonymous orders
      try {
        console.log('Fetching anonymous orders...');
        const anonOrdersRef = collection(db, 'anonymousOrders');
        const anonOrdersSnapshot = await getDocs(anonOrdersRef);
        
        for (const anonDoc of anonOrdersSnapshot.docs) {
          const anonUserOrdersRef = collection(db, 'anonymousOrders', anonDoc.id, 'orders');
          const anonUserOrdersQuery = query(anonUserOrdersRef, orderBy('createdAt', 'desc'));
          const anonUserOrdersSnapshot = await getDocs(anonUserOrdersQuery);
          
          anonUserOrdersSnapshot.forEach((orderDoc) => {
            try {
              const data = orderDoc.data();
              const orderDate = data.createdAt?.toDate?.();
              ordersList.push({
                id: orderDoc.id,
                ...data,
                date: orderDate ? orderDate.toLocaleDateString() : 'N/A',
                customer: data.customerDetails?.email || 'Guest User',
                total: data.total || 0,
                status: data.status || 'pending',
                isAnonymous: true,
                source: `anon_${anonDoc.id}`
              });
            } catch (error) {
              console.error('Error processing anonymous order:', error);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching anonymous orders:', error);
      }

      // Sort all orders by date (newest first)
      const sortedOrders = [...ordersList].sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return dateB - dateA;
      });
      
      console.log(`Total orders found: ${sortedOrders.length}`);
      console.log('Orders data:', sortedOrders);
      setOrders(sortedOrders);
      setLoading(false);
    };

    fetchAllOrders();
  }, []);

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find((opt) => opt.value === status);
    return statusOption ? statusOption.color : 'default';
  };

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find((opt) => opt.value === status);
    return statusOption ? statusOption.label : status;
  };

  // Filter orders based on search term and status filter
  const filteredRows = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      order.id?.toLowerCase().includes(searchLower) ||
      order.customerDetails?.email?.toLowerCase().includes(searchLower) ||
      order.id?.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate displayed rows based on pagination
  const displayedRows = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };


  return (
    <Box className="ordersContainer">
      <Box className="ordersHeader">
        <Typography variant="h4" component="h1">
          Orders Management
        </Typography>
        
        <Box className="searchContainer">
          <TextField
            className="searchField"
            placeholder="Search orders..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleFilterClick}
            className="actionButton"
          >
            Filter
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleFilterClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <div className="filterMenu">
              <Typography variant="subtitle2" className="filterTitle">
                Filter by Status
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  displayEmpty
                  size="small"
                >
                  <MenuItem value="">All Status</MenuItem>
                  {statusOptions.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <div className="filterActions">
                <Button 
                  size="small" 
                  onClick={() => {
                    setStatusFilter('');
                    handleFilterClose();
                  }}
                  disabled={!statusFilter}
                >
                  Reset
                </Button>
              </div>
            </div>
          </Menu>
        </Box>
      </Box>
      
      <Paper elevation={0} className="tablePaper">
        {loading ? (
          <div className="emptyState">
            <CircularProgress />
          </div>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow className="tableHeader">
                  <TableCell>ORDER</TableCell>
                  <TableCell>CUSTOMER</TableCell>
                  <TableCell>DATE</TableCell>
                  <TableCell>ITEMS</TableCell>
                  <TableCell>TOTAL</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell align="right">ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedRows.length > 0 ? (
                  displayedRows.map((order) => (
                    <TableRow
                      key={order.id}
                      hover
                      className="tableRow"
                    >
                      <TableCell component="th" scope="row" className="orderIdCell">
                        #{order.id.substring(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="customerEmail">
                          {order.customerDetails?.email || 'Guest User'}
                          {order.isAnonymous && <span className="guestBadge">(Guest)</span>}
                        </div>
                      </TableCell>
                      <TableCell>{order.date || 'N/A'}</TableCell>
                      <TableCell>{order.items?.length || 0} items</TableCell>
                      <TableCell className="totalCell">${order.total?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(order.status)}
                          color={getStatusColor(order.status)}
                          size="small"
                          variant="outlined"
                          className="statusChip"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ReceiptIcon />}
                          onClick={() => handleViewOrder(order.id)}
                          sx={{ mr: 1 }}
                        >
                          View
                        </Button>
                        {order.status === 'confirmed' && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<ShippingIcon />}
                            onClick={() => {}}
                            color="primary"
                          >
                            Ship
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body1" color="textSecondary">
                          No orders found
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Try adjusting your search or filter criteria
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default Orders;
