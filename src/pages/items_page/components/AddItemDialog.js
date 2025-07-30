import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Grid,
  DialogActions,
  Typography,
  Divider,
  useTheme
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { ItemModel } from '../../../models/ItemModel';

// Import existing form components
import BasicInfoForm from '../../add_items_page/components/BasicInfoForm';
import CategoryForm from '../../add_items_page/components/CategoryForm';
import SizesColorsForm from '../../add_items_page/components/SizesColorsForm';
import TagsForm from '../../add_items_page/components/TagsForm';
import ImagesForm from '../../add_items_page/components/ImagesForm';

// Import Firebase service
import { addItem, updateItem } from '../../../firebase/services/itemService';

const ITEM_FORM_INITIAL_STATE = {
  name: '',
  description: '',
  price: '',
  discountPrice: '',
  stock: '',
  gender: '',
  category: '',
  subCategory: '',
  sizes: [],
  colors: [],
  material: '',
  featured: false,
  tags: [],
  brand: ''
};

// Function to generate placeholder images locally using canvas
const generatePlaceholderImage = (text) => {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  
  // Fill with a gradient background (reddish theme)
  const gradient = ctx.createLinearGradient(0, 0, 400, 400);
  gradient.addColorStop(0, '#ffcccb');
  gradient.addColorStop(1, '#ff6b6b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 400, 400);
  
  // Add text
  ctx.font = 'bold 30px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 200, 200);
  
  // Convert to data URL
  return canvas.toDataURL('image/png');
};

const AddItemDialog = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState(ITEM_FORM_INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If item is provided, populate form for editing
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price?.toString() || '',
        discountPrice: item.discountPrice?.toString() || '',
        stock: item.stock?.toString() || '',
        gender: item.gender || '',
        category: item.category || '',
        subCategory: item.subCategory || '',
        sizes: item.sizes || [],
        colors: item.colors || [],
        material: item.material || '',
        featured: item.featured || false,
        tags: item.tags || [],
        brand: item.brand || ''
      });
      
      // If item has images, set the preview URLs
      if (item.images && item.images.length > 0) {
        setImagePreviewUrls(item.images);
      }
    }
  }, [item]);
  
  // Set up default placeholder images for categories
  useEffect(() => {
    if (imagePreviewUrls.length === 0) {
      // Use placeholder images based on category
      const placeholders = [];
      if (formData.category === 'tops') {
        placeholders.push(generatePlaceholderImage('T-Shirt'));
      } else if (formData.category === 'bottoms') {
        placeholders.push(generatePlaceholderImage('Pants'));
      } else if (formData.category === 'dresses') {
        placeholders.push(generatePlaceholderImage('Dress'));
      } else if (formData.category === 'outerwear') {
        placeholders.push(generatePlaceholderImage('Jacket'));
      } else {
        placeholders.push(generatePlaceholderImage('Fashion Item'));
      }
      setImagePreviewUrls(placeholders);
    }
  }, [formData.category, imagePreviewUrls.length]);

  // Form handling functions
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  const handleMultiSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };
  
  // Generate a local placeholder image instead of using external service
  const generatePlaceholderImage = (text) => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text
    ctx.fillStyle = '#888888';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text || 'Placeholder', canvas.width / 2, canvas.height / 2);
    
    return canvas.toDataURL('image/png');
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 5 images total
    if (imageFiles.length + files.length > 5) {
      setErrors({
        ...errors,
        images: 'Maximum 5 images allowed'
      });
    } else {
      setImageFiles([...imageFiles, ...files]);
      
      // Create preview URLs
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    }
    
    // Clear any image errors
    if (errors.images) {
      setErrors({
        ...errors,
        images: null
      });
    }
  };
  
  const handleRemoveImage = (index) => {
    // Remove file and preview URL at the specified index
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
    
    const newPreviewUrls = [...imagePreviewUrls];
    newPreviewUrls.splice(index, 1);
    setImagePreviewUrls(newPreviewUrls);
  };
  
  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation for required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price.trim()) newErrors.price = 'Price is required';
    else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (formData.discountPrice.trim() && (isNaN(parseFloat(formData.discountPrice)) || parseFloat(formData.discountPrice) < 0)) {
      newErrors.discountPrice = 'Discount price must be a non-negative number';
    }
    
    if (!formData.stock.trim()) newErrors.stock = 'Stock quantity is required';
    else if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Stock must be a non-negative integer';
    }
    
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.sizes.length === 0) newErrors.sizes = 'At least one size is required';
    if (formData.colors.length === 0) newErrors.colors = 'At least one color is required';
    
    if (imagePreviewUrls.length === 0) {
      newErrors.images = 'At least one image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      setErrorMessage('');
      
      try {
        // Create item model
        const newItem = new ItemModel({
          ...formData,
          price: parseFloat(formData.price),
          discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : 0,
          stock: parseInt(formData.stock),
          // In a real app, we would upload images to storage and get URLs
          images: imagePreviewUrls,
          mainImage: imagePreviewUrls[0] || ''
        });
        
        console.log('Item to save:', newItem.toFirebase());
        
        // Save to Firebase
        if (item) {
          // Update existing item
          await updateItem(item.id, newItem, imageFiles);
          console.log('Updating item with ID:', item.id);
        } else {
          // Add new item
          const itemId = await addItem(newItem, imageFiles);
          console.log('Item added with ID:', itemId);
        }
        
        setSuccess(true);
        
        // Notify parent component only on success
        onSave();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } catch (error) {
        console.error('Error saving item:', error);
        setErrorMessage('Failed to save item. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      console.log('Form validation failed');
    }
  };

  const theme = useTheme();

  return (
    <Box sx={{ width: '100%' }}>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2, fontWeight: 'bold' }}>
          {errorMessage}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Item {item ? 'updated' : 'added'} successfully!
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} sx={{ maxHeight: '70vh', overflowY: 'auto', px: 2, py: 1 }}>
        <Grid container spacing={3} direction="column">
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" color="error" sx={{ mb: 1, fontWeight: 500 }}>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2, backgroundColor: theme.palette.error.light }} />
            <BasicInfoForm 
              formData={formData} 
              errors={errors} 
              handleChange={handleChange} 
            />
          </Grid>
          
          {/* Category Information */}
          <Grid item xs={12}>
            <Typography variant="h6" color="error" sx={{ mb: 1, mt: 2, fontWeight: 500 }}>
              Category Information
            </Typography>
            <Divider sx={{ mb: 2, backgroundColor: theme.palette.error.light }} />
            <CategoryForm 
              formData={formData} 
              errors={errors} 
              handleChange={handleChange} 
              handleCheckboxChange={handleCheckboxChange} 
            />
          </Grid>
          
          {/* Sizes and Colors */}
          <Grid item xs={12}>
            <Typography variant="h6" color="error" sx={{ mb: 1, mt: 2, fontWeight: 500 }}>
              Sizes and Colors
            </Typography>
            <Divider sx={{ mb: 2, backgroundColor: theme.palette.error.light }} />
            <SizesColorsForm 
              formData={formData} 
              errors={errors} 
              handleMultiSelectChange={handleMultiSelectChange} 
            />
          </Grid>
          
          {/* Tags */}
          <Grid item xs={12}>
            <Typography variant="h6" color="error" sx={{ mb: 1, mt: 2, fontWeight: 500 }}>
              Tags
            </Typography>
            <Divider sx={{ mb: 2, backgroundColor: theme.palette.error.light }} />
            <TagsForm 
              formData={formData} 
              tagInput={tagInput} 
              setTagInput={setTagInput} 
              handleAddTag={handleAddTag} 
              handleRemoveTag={handleRemoveTag} 
            />
          </Grid>
          
          {/* Images */}
          <Grid item xs={12}>
            <Typography variant="h6" color="error" sx={{ mb: 1, mt: 2, fontWeight: 500 }}>
              Images
            </Typography>
            <Divider sx={{ mb: 2, backgroundColor: theme.palette.error.light }} />
            <ImagesForm 
              imageFiles={imageFiles} 
              imagePreviewUrls={imagePreviewUrls} 
              errors={errors} 
              handleImageUpload={handleImageUpload} 
              handleRemoveImage={handleRemoveImage} 
            />
          </Grid>
        </Grid>
      </Box>
      
      <DialogActions sx={{ mt: 3, px: 3, pb: 2 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleSubmit}
          startIcon={loading ? <CircularProgress size={24} color="inherit" /> : (item ? <SaveIcon /> : <AddIcon />)}
          disabled={loading}
          sx={{ 
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.dark
            }
          }}
        >
          {loading ? 'Saving...' : (item ? 'Update Item' : 'Add Item')}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default AddItemDialog;
