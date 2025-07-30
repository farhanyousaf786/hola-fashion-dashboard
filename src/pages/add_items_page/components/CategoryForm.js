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
import { ITEM_CATEGORIES } from '../../../models/ItemModel';

const CategoryForm = ({ formData, errors, handleChange, handleCheckboxChange }) => {
  // Get categories based on selected gender
  const getCategories = () => {
    if (!formData.gender) return [];
    return ITEM_CATEGORIES[formData.gender.toUpperCase()] || [];
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
