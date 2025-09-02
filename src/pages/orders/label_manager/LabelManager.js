import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Visibility as ViewIcon,
  LocalShipping as ShippingIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const API_BASE = process.env.NODE_ENV === 'production' ? '' : (process.env.REACT_APP_API_BASE || 'http://localhost:3001');

const LabelManager = ({ rate, onLabelPurchased, orderId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [labelData, setLabelData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const buyLabel = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Purchasing label for rate:', rate);
      
      const response = await fetch(`${API_BASE}/api/shippo/buy-label`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate })
      });

      const data = await response.json();
      console.log('Label purchase response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to purchase label');
      }

      setLabelData(data);
      
      // Notify parent component
      if (onLabelPurchased) {
        onLabelPurchased({
          tracking_number: data.tracking_number,
          tracking_url: data.tracking_url_provider,
          label_url: data.label_url,
          carrier: data.carrier,
          service: data.servicelevel,
          amount: data.amount
        });
      }

    } catch (err) {
      console.error('Label purchase error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadLabel = () => {
    if (labelData?.label_url) {
      window.open(labelData.label_url, '_blank');
    }
  };

  const printLabel = () => {
    if (labelData?.label_url) {
      const printWindow = window.open(labelData.label_url, '_blank');
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const viewLabel = () => {
    setShowPreview(true);
  };

  if (labelData) {
    return (
      <Card variant="outlined" sx={{ mt: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircleIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Label Purchased Successfully!</Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Tracking Number:</strong> {labelData.tracking_number}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Carrier:</strong> {labelData.carrier}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Service:</strong> {labelData.servicelevel}
            </Typography>
            <Typography variant="body2">
              <strong>Cost:</strong> ${labelData.amount}
            </Typography>
          </Box>

          <Divider sx={{ my: 2, bgcolor: 'success.contrastText', opacity: 0.3 }} />

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={downloadLabel}
              size="small"
            >
              Download Label
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={printLabel}
              size="small"
              sx={{ color: 'success.contrastText', borderColor: 'success.contrastText' }}
            >
              Print Label
            </Button>
            <Button
              variant="outlined"
              startIcon={<ViewIcon />}
              onClick={viewLabel}
              size="small"
              sx={{ color: 'success.contrastText', borderColor: 'success.contrastText' }}
            >
              View Label
            </Button>
            {labelData.tracking_url_provider && (
              <Button
                variant="outlined"
                startIcon={<ShippingIcon />}
                onClick={() => window.open(labelData.tracking_url_provider, '_blank')}
                size="small"
                sx={{ color: 'success.contrastText', borderColor: 'success.contrastText' }}
              >
                Track Package
              </Button>
            )}
          </Box>

          {/* Label Preview Dialog */}
          <Dialog
            open={showPreview}
            onClose={() => setShowPreview(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Shipping Label Preview
              <IconButton
                onClick={() => setShowPreview(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <iframe
                  src={labelData.label_url}
                  width="100%"
                  height="600px"
                  style={{ border: 'none' }}
                  title="Shipping Label"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={downloadLabel} startIcon={<DownloadIcon />}>
                Download
              </Button>
              <Button onClick={printLabel} startIcon={<PrintIcon />}>
                Print
              </Button>
              <Button onClick={() => setShowPreview(false)}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {rate.provider} - {rate.servicelevel?.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Chip 
                  label={`$${rate.amount}`} 
                  color="primary" 
                  size="small" 
                />
                <Chip 
                  label={`${rate.estimated_days || 'N/A'} days`} 
                  variant="outlined" 
                  size="small" 
                />
              </Box>
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              onClick={buyLabel}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <ShippingIcon />}
            >
              {loading ? 'Purchasing...' : 'Buy Label'}
            </Button>
          </Box>

          {rate.messages && rate.messages.length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {rate.messages.map(msg => msg.text || msg.message).join(', ')}
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LabelManager;
