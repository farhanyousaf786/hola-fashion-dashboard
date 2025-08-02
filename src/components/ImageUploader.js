import React, { useRef, useState } from 'react';
import { Box, Button, IconButton, Typography, Divider } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';

const ImageUploader = ({ onImagesChange, maxImages = 10 }) => {
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    console.log(`Adding ${newFiles.length} new images:`, newFiles.map(f => f.name));
    
    // Combine existing files with new files, but don't exceed maxImages
    const combinedFiles = [...imageFiles, ...newFiles].slice(0, maxImages);
    console.log(`Total images after adding: ${combinedFiles.length}`);
    
    setImageFiles(combinedFiles);
    
    // Create preview URLs for all images (existing + new)
    const previews = combinedFiles.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));
    setImagePreviews(previews);
    
    // Clear the file input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (onImagesChange) onImagesChange(combinedFiles);
  };

  const handleRemoveImage = (indexToRemove) => {
    const updatedFiles = imageFiles.filter((_, index) => index !== indexToRemove);
    const updatedPreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
    
    setImageFiles(updatedFiles);
    setImagePreviews(updatedPreviews);
    if (onImagesChange) onImagesChange(updatedFiles);
  };

  const handleClearImages = () => {
    setImageFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onImagesChange) onImagesChange([]);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload"
        type="file"
        multiple
        onChange={handleImageUpload}
        ref={fileInputRef}
      />
      <label htmlFor="image-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUploadIcon />}
          color="error"
          sx={{ backgroundColor: 'error.main', '&:hover': { backgroundColor: 'error.dark' } }}
        >
          {imageFiles.length > 0 ? `Add More Images (${imageFiles.length}/${maxImages})` : 'Upload Images'}
        </Button>
      </label>
      {imagePreviews.length > 0 && (
        <Box sx={{ mt: 2, width: '100%', maxWidth: 500 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Selected Images ({imageFiles.length}/{maxImages}):
          </Typography>
          
          {/* Image List View */}
          <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
            {imagePreviews.map((preview, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, p: 1, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                <img
                  src={preview.url}
                  alt={`Preview ${idx + 1}`}
                  style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {preview.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(preview.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveImage(idx)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {imageFiles.length} {imageFiles.length === 1 ? 'image' : 'images'} selected
            </Typography>
            <Button
              size="small"
              onClick={handleClearImages}
              sx={{ color: 'error.main' }}
            >
              Clear All
            </Button>
          </Box>
        </Box>
      )}
      <Divider sx={{ width: '100%', my: 1, backgroundColor: 'error.light' }} />
    </Box>
  );
};

export default ImageUploader;
