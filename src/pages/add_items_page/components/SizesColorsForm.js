import React from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Box
} from '@mui/material';
import { COMMON_SIZES, COMMON_COLORS } from '../../../models/ItemModel';

const SizesColorsForm = ({ formData, errors, handleMultiSelectChange }) => {
  return (
    <>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.sizes} required>
          <InputLabel>Sizes</InputLabel>
          <Select
            multiple
            name="sizes"
            value={formData.sizes}
            onChange={handleMultiSelectChange}
            input={<OutlinedInput label="Sizes" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {COMMON_SIZES.LETTER.map((size) => (
              <MenuItem key={size} value={size}>
                <Checkbox checked={formData.sizes.indexOf(size) > -1} />
                <ListItemText primary={size} />
              </MenuItem>
            ))}
          </Select>
          {errors.sizes && <FormHelperText>{errors.sizes}</FormHelperText>}
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.colors} required>
          <InputLabel>Colors</InputLabel>
          <Select
            multiple
            name="colors"
            value={formData.colors}
            onChange={handleMultiSelectChange}
            input={<OutlinedInput label="Colors" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => {
                  const colorObj = COMMON_COLORS.find(color => color.name === value);
                  return (
                    <Chip 
                      key={value} 
                      label={value} 
                      sx={{ 
                        backgroundColor: colorObj?.hex,
                        color: ['White', 'Yellow', 'Beige'].includes(value) ? 'black' : 'white'
                      }} 
                    />
                  );
                })}
              </Box>
            )}
          >
            {COMMON_COLORS.map((color) => (
              <MenuItem key={color.name} value={color.name}>
                <Checkbox checked={formData.colors.indexOf(color.name) > -1} />
                <Box 
                  sx={{ 
                    width: 20, 
                    height: 20, 
                    backgroundColor: color.hex,
                    mr: 1,
                    border: '1px solid #ddd'
                  }} 
                />
                <ListItemText primary={color.name} />
              </MenuItem>
            ))}
          </Select>
          {errors.colors && <FormHelperText>{errors.colors}</FormHelperText>}
        </FormControl>
      </Grid>
    </>
  );
};

export default SizesColorsForm;
