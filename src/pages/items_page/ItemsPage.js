import React, { useState, useEffect } from 'react';
import './ItemsPage.css';
import ItemCard from './components/ItemCard';
import AddItemDialog from './components/AddItemDialog';
import { getAllItems, deleteItem } from '../../firebase/services/itemService';

const ItemsPage = () => {
  const [snackbarClosing, setSnackbarClosing] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch items from Firebase when component mounts
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch items from Firebase
      const fetchedItems = await getAllItems();
      setItems(fetchedItems);
      console.log('Fetched items from Firebase:', fetchedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to load items. Please try again later.');
    } finally {
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

  const handleDialogSuccess = () => {
    fetchItems(); // Refresh the items list
    handleCloseDialog();
    // Show success message
    setSnackbarMessage('Item saved successfully');
    setSnackbarOpen(true);
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setLoading(true);
        await deleteItem(id);
        // Show success message
        setSnackbarMessage('Item deleted successfully');
        setSnackbarOpen(true);
        // Refresh items list
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
        setError('Failed to delete item. Please try again.');
        setSnackbarMessage('Failed to delete item');
        setSnackbarOpen(true);
        setLoading(false);
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarClosing(true);
    setTimeout(() => {
      setSnackbarOpen(false);
      setSnackbarClosing(false);
    }, 300);
  };

  return (
    <div className="items-page">
      <div className="items-page-container">
        <div className="items-page-header">
          <h1 className="items-page-title">Items</h1>
          <button 
            className="add-item-button"
            onClick={() => handleOpenDialog()}
          >
            <span className="add-icon"></span>
            Add Item
          </button>
        </div>

      {/* Error message */}
      {error && (
        <div className="error-alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <ItemCard 
              key={item.id} 
              item={item} 
              onEdit={handleOpenDialog} 
              onDelete={handleDeleteItem} 
            />
          ))}
          
          {items.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"></div>
              <h2 className="empty-state-title">No items found</h2>
              <p className="empty-state-text">Click the "Add Item" button to add your first item</p>
              <button 
                className="add-item-button"
                onClick={() => handleOpenDialog()}
              >
                <span className="add-icon"></span>
                Add First Item
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Item Dialog */}
      {openDialog && (
        <div className="dialog-overlay" onClick={handleCloseDialog}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">
              {selectedItem ? 'Edit Item' : 'Add New Item'}
            </div>
            <div className="dialog-content">
              <AddItemDialog 
                item={selectedItem} 
                onSave={handleDialogSuccess} 
                onCancel={handleCloseDialog}
              />
            </div>
          </div>
        </div>
      )}

      {/* Snackbar for notifications */}
      {snackbarOpen && (
        <div className={`snackbar ${snackbarClosing ? 'hide' : ''}`}>
          <span className="snackbar-message">{snackbarMessage}</span>
          <button className="snackbar-close" onClick={handleSnackbarClose}>×</button>
        </div>
      )}
    </div>
    </div>
  );
};

export default ItemsPage;