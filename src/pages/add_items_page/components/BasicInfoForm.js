import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Divider,
  InputAdornment
} from '@mui/material';

const BasicInfoForm = ({ formData, errors, handleChange }) => {
  return (
    <>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Item Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
          required
          sx={{ mb: 2 }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Brand"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={4}
          error={!!errors.description}
          helperText={errors.description}
          required
          sx={{ mb: 2 }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          error={!!errors.price}
          helperText={errors.price}
          required
          sx={{ mb: 2 }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Discount Price (Optional)"
          name="discountPrice"
          value={formData.discountPrice}
          onChange={handleChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          error={!!errors.discountPrice}
          helperText={errors.discountPrice}
          sx={{ mb: 2 }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Stock Quantity"
          name="stock"
          type="number"
          value={formData.stock}
          onChange={handleChange}
          error={!!errors.stock}
          helperText={errors.stock}
          required
          sx={{ mb: 2 }}
        />
      </Grid>
    </>
  );
};

export default BasicInfoForm;
