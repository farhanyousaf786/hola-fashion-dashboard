import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import AddItemDialog from './components/AddItemDialog';
// Uncomment when ready to connect to Firebase
// import { getItems, deleteItem } from '../../firebase/services/itemService';

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch items from Firebase when component mounts
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      // Uncomment when ready to connect to Firebase
      // const fetchedItems = await getItems();
      // setItems(fetchedItems);
      
      // For now, use dummy data
      setTimeout(() => {
        setItems([
          {
            id: '1',
            name: 'Classic T-Shirt',
            description: 'A comfortable cotton t-shirt for everyday wear',
            price: 29.99,
            discountPrice: 19.99,
            gender: 'men',
            category: 'tshirts',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Black', 'White', 'Navy'],
            stock: 100,
            featured: true,
            mainImage: 'https://via.placeholder.com/300x400?text=T-Shirt',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Summer Dress',
            description: 'Light and airy summer dress perfect for hot days',
            price: 59.99,
            discountPrice: 0,
            gender: 'women',
            category: 'dresses',
            sizes: ['XS', 'S', 'M', 'L'],
            colors: ['Red', 'Blue', 'Yellow'],
            stock: 50,
            featured: false,
            mainImage: 'https://via.placeholder.com/300x400?text=Dress',
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Denim Jacket',
            description: 'Classic denim jacket that never goes out of style',
            price: 89.99,
            discountPrice: 69.99,
            gender: 'unisex',
            category: 'jackets',
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            colors: ['Blue', 'Black'],
            stock: 30,
            featured: true,
            mainImage: 'https://via.placeholder.com/300x400?text=Jacket',
            createdAt: new Date().toISOString()
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  const handleAddItem = () => {
    fetchItems(); // Refresh the items list
    handleCloseDialog();
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        // Uncomment when ready to connect to Firebase
        // await deleteItem(id);
        // Refresh items list
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4">Items</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Item
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Card 
                elevation={3}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={item.mainImage || 'https://via.placeholder.com/300x400?text=No+Image'}
                  alt={item.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div" noWrap>
                    {item.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      {item.discountPrice > 0 ? (
                        <>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ textDecoration: 'line-through' }}
                          >
                            ${item.price.toFixed(2)}
                          </Typography>
                          <Typography variant="body1" color="error" fontWeight="bold">
                            ${item.discountPrice.toFixed(2)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body1" fontWeight="bold">
                          ${item.price.toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                    <Chip 
                      label={item.gender.charAt(0).toUpperCase() + item.gender.slice(1)} 
                      size="small"
                      color={item.gender === 'men' ? 'primary' : item.gender === 'women' ? 'secondary' : 'default'}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {item.description}
                  </Typography>
                  
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" display="block">
                      Stock: {item.stock}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {item.sizes.slice(0, 3).map((size) => (
                        <Chip key={size} label={size} size="small" variant="outlined" />
                      ))}
                      {item.sizes.length > 3 && (
                        <Chip label={`+${item.sizes.length - 3}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </Box>
                </CardContent>
                <Divider />
                <CardActions>
                  <Tooltip title="View Details">
                    <IconButton size="small" color="primary">
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Item">
                    <IconButton 
                      size="small" 
                      color="secondary"
                      onClick={() => handleOpenDialog(item)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Item">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  {item.featured && (
                    <Chip 
                      label="Featured" 
                      size="small" 
                      color="primary" 
                      sx={{ ml: 'auto' }}
                    />
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
          
          {items.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No items found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click the "Add Item" button to add your first item
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Add/Edit Item Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          fontSize: '1.5rem',
          fontWeight: 500
        }}>
          {selectedItem ? 'Edit Item' : 'Add New Item'}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <AddItemDialog 
            item={selectedItem} 
            onSave={handleAddItem} 
            onCancel={handleCloseDialog} 
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ItemsPage;
