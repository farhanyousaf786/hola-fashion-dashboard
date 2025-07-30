import React from 'react';
import {
  Grid,
  Typography,
  Divider,
  Button,
  FormHelperText,
  IconButton,
  Paper,
  Chip
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const ImagesForm = ({ imageFiles, imagePreviewUrls, errors, handleImageUpload, handleRemoveImage }) => {
  return (
    <>
      <Grid item xs={12} sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Images
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12}>
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
          sx={{ mb: 2 }}
        >
          Upload Images
          <input
            type="file"
            hidden
            accept="image/*"
            multiple
            onChange={handleImageUpload}
          />
        </Button>
        
        {errors.images && (
          <FormHelperText error sx={{ ml: 2 }}>
            {errors.images}
          </FormHelperText>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload up to 5 images. The first image will be used as the main product image.
        </Typography>
        
        <Grid container spacing={2}>
          {imagePreviewUrls.map((url, index) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
              <Paper 
                elevation={2} 
                sx={{ 
                  position: 'relative',
                  height: 150,
                  overflow: 'hidden'
                }}
              >
                <img 
                  src={url} 
                  alt={`Product image ${index + 1}`} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }} 
                />
                <IconButton
                  size="small"
                  sx={{ 
                    position: 'absolute', 
                    top: 5, 
                    right: 5,
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)',
                    }
                  }}
                  onClick={() => handleRemoveImage(index)}
                >
                  <DeleteIcon />
                </IconButton>
                {index === 0 && (
                  <Chip
                    label="Main"
                    size="small"
                    color="primary"
                    sx={{ 
                      position: 'absolute', 
                      bottom: 5, 
                      left: 5
                    }}
                  />
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </>
  );
};

export default ImagesForm;
