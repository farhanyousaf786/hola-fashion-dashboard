import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Grid,
  DialogActions,
  Typography,
  Divider,
  useTheme,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { ItemModel } from '../../../models/ItemModel';

// Import existing form components
import BasicInfoForm from '../../add_items_page/components/BasicInfoForm';
import CategoryForm from '../../add_items_page/components/CategoryForm';
import SizesColorsForm from '../../add_items_page/components/SizesColorsForm';
import TagsForm from '../../add_items_page/components/TagsForm';

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



const AddItemDialog = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState(ITEM_FORM_INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

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
    }
  }, [item]);

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
  
  // Handle tag input changes
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles(files);
      
      // Create preview for the first image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };
  
  // Clear selected images
  const handleClearImages = () => {
    setImageFiles([]);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Convert form data to ItemModel
      const itemData = new ItemModel({
        id: item?.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : 0,
        stock: parseInt(formData.stock, 10),
        gender: formData.gender,
        category: formData.category,
        subCategory: formData.subCategory,
        sizes: formData.sizes,
        colors: formData.colors,
        material: formData.material,
        featured: formData.featured,
        tags: formData.tags,
        brand: formData.brand,
        // Use placeholder image if no image is uploaded
        mainImage: imageFiles.length === 0 ? 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg' : ''
      });
      
      if (item?.id) {
        // Update existing item
        await updateItem(item.id, itemData, imageFiles);
        console.log('Item updated successfully');
      } else {
        // Add new item
        await addItem(itemData, imageFiles);
        console.log('Adding new item');
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
              handleTagInputChange={handleTagInputChange}
              handleAddTag={handleAddTag} 
              handleRemoveTag={handleRemoveTag} 
            />
          </Grid>

          {/* Image Upload */}
          <Grid item xs={12}>
            <Typography variant="h6" color="error" sx={{ mb: 1, mt: 2, fontWeight: 500 }}>
              Product Images
            </Typography>
            <Divider sx={{ mb: 2, backgroundColor: theme.palette.error.light }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageUpload}
                ref={fileInputRef}
              />
              
              <label htmlFor="image-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  color="error"
                  sx={{ 
                    backgroundColor: theme.palette.error.main,
                    '&:hover': {
                      backgroundColor: theme.palette.error.dark
                    }
                  }}
                >
                  Upload Images
                </Button>
              </label>
              
              {imagePreview && (
                <Box sx={{ mt: 2, position: 'relative', width: '100%', maxWidth: 300 }}>
                  <img 
                    src={imagePreview} 
                    alt="Product preview" 
                    style={{ width: '100%', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
                  />
                  <IconButton 
                    size="small" 
                    sx={{ 
                      position: 'absolute', 
                      top: 5, 
                      right: 5, 
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                    }}
                    onClick={handleClearImages}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                    {imageFiles.length} {imageFiles.length === 1 ? 'image' : 'images'} selected
                  </Typography>
                </Box>
              )}
            </Box>
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
