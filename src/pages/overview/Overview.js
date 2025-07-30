import React from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  TrendingUp, 
  ShoppingBag, 
  AttachMoney, 
  People 
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Overview = () => {
  // Sample data for charts
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const categoryData = {
    labels: ['Dresses', 'Tops', 'Pants', 'Accessories', 'Shoes'],
    datasets: [
      {
        label: 'Sales by Category',
        data: [12, 19, 3, 5, 2],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Sample recent orders
  const recentOrders = [
    { id: '#ORD-001', customer: 'John Doe', date: '2025-07-29', amount: '$120.00', status: 'Delivered' },
    { id: '#ORD-002', customer: 'Jane Smith', date: '2025-07-28', amount: '$85.50', status: 'Processing' },
    { id: '#ORD-003', customer: 'Robert Johnson', date: '2025-07-27', amount: '$210.75', status: 'Shipped' },
    { id: '#ORD-004', customer: 'Emily Davis', date: '2025-07-26', amount: '$45.99', status: 'Delivered' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Overview
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <ShoppingBag sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h6" component="div">
                Total Orders
              </Typography>
              <Typography variant="h4" component="div">
                156
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <AttachMoney sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
            <Box>
              <Typography variant="h6" component="div">
                Revenue
              </Typography>
              <Typography variant="h4" component="div">
                $12,846
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <People sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
            <Box>
              <Typography variant="h6" component="div">
                Customers
              </Typography>
              <Typography variant="h4" component="div">
                89
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
            <Box>
              <Typography variant="h6" component="div">
                Growth
              </Typography>
              <Typography variant="h4" component="div">
                +24%
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales History
            </Typography>
            <Line 
              data={salesData} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Monthly Sales'
                  }
                }
              }} 
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales by Category
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ maxWidth: 300 }}>
                <Doughnut data={categoryData} />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Recent Orders */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              <List>
                {recentOrders.map((order, index) => (
                  <React.Fragment key={order.id}>
                    <ListItem>
                      <Grid container spacing={2}>
                        <Grid item xs={3}>
                          <ListItemText primary={order.id} secondary={order.date} />
                        </Grid>
                        <Grid item xs={3}>
                          <ListItemText primary={order.customer} />
                        </Grid>
                        <Grid item xs={3}>
                          <ListItemText primary={order.amount} />
                        </Grid>
                        <Grid item xs={3}>
                          <ListItemText 
                            primary={order.status} 
                            primaryTypographyProps={{ 
                              color: 
                                order.status === 'Delivered' ? 'success.main' : 
                                order.status === 'Processing' ? 'warning.main' : 
                                'info.main'
                            }} 
                          />
                        </Grid>
                      </Grid>
                    </ListItem>
                    {index < recentOrders.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview;
