import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const ShippingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, margin: '0 auto' }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back to Order
      </Button>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocalShippingIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5" component="h1">
            Shipping for Order #{orderId}
          </Typography>
        </Box>
        
        <Typography color="text.secondary" paragraph>
          Shipping details and tracking information will be managed here.
        </Typography>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary">
            Add Tracking
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ShippingPage;
