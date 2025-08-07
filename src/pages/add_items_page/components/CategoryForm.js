import React from 'react';
import {
  Grid,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  TextField,
  Checkbox
} from '@mui/material';
import { ITEM_CATEGORIES, HEADER_CATEGORIES, SUB_HEADER_CATEGORIES } from '../../../models/ItemModel';

const CategoryForm = ({ formData, errors, handleChange, handleCheckboxChange }) => {
  // Get categories based on selected gender
  const getCategories = () => {
    if (!formData.gender) return [];
    return ITEM_CATEGORIES[formData.gender.toUpperCase()] || [];
  };

  // Get sub-header categories based on selected header category
  const getSubHeaderCategories = () => {
    if (!formData.headerCategory) return [];
    return SUB_HEADER_CATEGORIES[formData.headerCategory] || [];
  };

  return (
    <>
      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.gender} required sx={{ mb: 2 }}>
          <FormLabel id="gender-radio-group-label">Gender</FormLabel>
          <RadioGroup
            row
            aria-labelledby="gender-radio-group-label"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <FormControlLabel value="men" control={<Radio color="error" />} label="Men" />
            <FormControlLabel value="women" control={<Radio color="error" />} label="Women" />
            <FormControlLabel value="unisex" control={<Radio color="error" />} label="Unisex" />
          </RadioGroup>
          {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.category} required sx={{ mb: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={!formData.gender}
          >
            {getCategories().map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
          {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Sub-Category (Optional)"
          name="subCategory"
          value={formData.subCategory}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.headerCategory} sx={{ mb: 2 }}>
          <InputLabel>Header Category</InputLabel>
          <Select
            name="headerCategory"
            value={formData.headerCategory}
            onChange={handleChange}
          >
            {HEADER_CATEGORIES.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
          {errors.headerCategory && <FormHelperText>{errors.headerCategory}</FormHelperText>}
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.subHeaderCategory} sx={{ mb: 2 }}>
          <InputLabel>Sub-Header Category (Optional)</InputLabel>
          <Select
            name="subHeaderCategory"
            value={formData.subHeaderCategory}
            onChange={handleChange}
            disabled={!formData.headerCategory}
          >
            {getSubHeaderCategories().map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
          {errors.subHeaderCategory && <FormHelperText>{errors.subHeaderCategory}</FormHelperText>}
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Material (Optional)"
          name="material"
          value={formData.material}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.featured}
              onChange={handleCheckboxChange}
              name="featured"
              color="error"
            />
          }
          label="Featured Item"
          sx={{ mb: 1 }}
        />
      </Grid>
    </>
  );
};

export default CategoryForm;
