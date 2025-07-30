import React from 'react';
import {
  Grid,
  Typography,
  Divider,
  Box,
  TextField,
  Button,
  Chip
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const TagsForm = ({ formData, tagInput, setTagInput, handleAddTag, handleRemoveTag }) => {
  return (
    <>
      <Grid item xs={12} sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Tags
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            label="Add Tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            sx={{ flexGrow: 1, mr: 1 }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleAddTag}
            startIcon={<AddIcon />}
          >
            Add
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {formData.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleRemoveTag(tag)}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      </Grid>
    </>
  );
};

export default TagsForm;
