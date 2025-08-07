import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import { ItemModel } from '../../models/ItemModel';

// Collection reference
const ITEMS_COLLECTION = 'items';

/**
 * Add a new item to Firestore
 * @param {ItemModel} item - The item to add
 * @param {File[]} imageFiles - Array of image files to upload
 * @returns {Promise<string>} - The ID of the newly created item
 */
export const addItem = async (item, imageFiles = []) => {
  console.log(`[ADD ITEM] Starting to add new item: ${item.name}`);
  console.log(`[ADD ITEM] Item details:`, JSON.stringify(item));
  console.log(`[ADD ITEM] Number of images to upload: ${imageFiles?.length || 0}`);
  
  try {
    // Upload images sequentially to avoid timeout issues
    console.log(`[ADD ITEM] Starting sequential image uploads...`);
    const imageUrls = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const isMain = i === 0;
      console.log(`[ADD ITEM] Uploading image ${i+1}/${imageFiles.length} (${isMain ? 'main' : 'additional'})...`);
      
      try {
        const url = await uploadItemImage(imageFiles[i], isMain);
        console.log(`[ADD ITEM] Image ${i+1} uploaded successfully`);
        imageUrls.push(url);
      } catch (uploadError) {
        console.error(`[ADD ITEM] Failed to upload image ${i+1}:`, uploadError);
        throw uploadError; // Re-throw to be caught by outer try-catch
      }
    }
    
    console.log(`[ADD ITEM] All images uploaded successfully. URLs:`, imageUrls);
    
    // Set the image URLs in the item
    const itemWithImages = {
      ...item.toFirebase(),
      images: imageUrls,
      mainImage: imageUrls[0] || '',
    };
    
    console.log(`[ADD ITEM] Prepared item with images for Firestore:`, itemWithImages);
    
    // Add the item to Firestore
    console.log(`[ADD ITEM] Adding item to Firestore collection: ${ITEMS_COLLECTION}...`);
    const docRef = await addDoc(collection(db, ITEMS_COLLECTION), itemWithImages);
    console.log(`[ADD ITEM] Item added successfully with ID: ${docRef.id}`);
    
    return docRef.id;
  } catch (error) {
    console.error(`[ADD ITEM ERROR] Error adding item:`, error);
    console.error(`[ADD ITEM ERROR] Error name: ${error.name}, message: ${error.message}`);
    console.error(`[ADD ITEM ERROR] Error code: ${error.code || 'N/A'}, stack: ${error.stack || 'N/A'}`);
    throw error;
  }
};

/**
 * Upload an item image to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {boolean} isMain - Whether this is the main product image
 * @returns {Promise<string>} - The download URL of the uploaded image
 */
export const uploadItemImage = async (file, isMain = false) => {
  console.log(`[UPLOAD] Starting upload for ${isMain ? 'main' : 'additional'} image: ${file.name} (${file.size} bytes)`);
  try {
    // Create a unique filename with timestamp
    const fileName = `${Date.now()}${isMain ? '_main_' : '_'}${file.name}`;
    console.log(`[UPLOAD] Generated filename: ${fileName}`);
    
    // Create a reference to the file in Firebase Storage
    console.log(`[UPLOAD] Creating storage reference to items/${fileName}`);
    const storageRef = ref(storage, `items/${fileName}`);
    console.log(`[UPLOAD] Storage reference created successfully`);
    
    // Upload the file
    console.log(`[UPLOAD] Starting uploadBytes operation...`);
    const snapshot = await uploadBytes(storageRef, file);
    console.log(`[UPLOAD] File uploaded successfully, size: ${snapshot.totalBytes} bytes`);
    
    // Get the download URL
    console.log(`[UPLOAD] Getting download URL...`);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`[UPLOAD] Got download URL: ${downloadURL.substring(0, 50)}...`);
    return downloadURL;
  } catch (error) {
    console.error(`[UPLOAD ERROR] Error uploading ${isMain ? 'main' : 'additional'} image:`, error);
    console.error(`[UPLOAD ERROR] Error name: ${error.name}, message: ${error.message}`);
    console.error(`[UPLOAD ERROR] Error code: ${error.code || 'N/A'}, stack: ${error.stack || 'N/A'}`);
    throw error; // Re-throw error for proper debugging
  }
};

// Placeholder image generation removed as we're now re-throwing errors for proper debugging

/**
 * Get all items from Firestore
 * @returns {Promise<ItemModel[]>} - Array of items
 */
export const getAllItems = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, ITEMS_COLLECTION));
    return querySnapshot.docs.map(doc => ItemModel.fromFirebase(doc.id, doc.data()));
  } catch (error) {
    console.error('Error getting items:', error);
    throw error;
  }
};

/**
 * Get a single item by ID
 * @param {string} id - The item ID
 * @returns {Promise<ItemModel|null>} - The item or null if not found
 */
export const getItemById = async (id) => {
  try {
    const docRef = doc(db, ITEMS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return ItemModel.fromFirebase(docSnap.id, docSnap.data());
    } else {
      console.log('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error getting item:', error);
    throw error;
  }
};

/**
 * Update an existing item in Firestore
 * @param {string} id - The ID of the item to update
 * @param {ItemModel} item - The updated item data
 * @param {File[]} newImageFiles - Array of new image files to upload
 * @returns {Promise<void>}
 */
export const updateItem = async (id, item, newImageFiles = []) => {
  console.log(`[UPDATE ITEM] Starting to update item: ${id}`);
  console.log(`[UPDATE ITEM] Updated item details:`, JSON.stringify(item));
  console.log(`[UPDATE ITEM] Number of new images to upload: ${newImageFiles?.length || 0}`);
  
  try {
    // Upload any new images sequentially
    let imageUrls = [];
    if (newImageFiles.length > 0) {
      console.log(`[UPDATE ITEM] Starting sequential upload of new images...`);
      
      for (let i = 0; i < newImageFiles.length; i++) {
        console.log(`[UPDATE ITEM] Uploading new image ${i+1}/${newImageFiles.length}...`);
        
        try {
          const url = await uploadItemImage(newImageFiles[i], false);
          console.log(`[UPDATE ITEM] New image ${i+1} uploaded successfully`);
          imageUrls.push(url);
        } catch (uploadError) {
          console.error(`[UPDATE ITEM] Failed to upload new image ${i+1}:`, uploadError);
          throw uploadError;
        }
      }
      
      console.log(`[UPDATE ITEM] All new images uploaded successfully`);
    }
    
    // Get the existing item to merge with existing images
    console.log(`[UPDATE ITEM] Fetching existing item data from Firestore...`);
    const docRef = doc(db, ITEMS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.error(`[UPDATE ITEM] Item with ID ${id} not found in Firestore`);
      throw new Error(`Item with ID ${id} not found`);
    }
    
    console.log(`[UPDATE ITEM] Existing item found in Firestore`);
    const existingData = docSnap.data();
    const existingImages = existingData.images || [];
    console.log(`[UPDATE ITEM] Existing images count: ${existingImages.length}`);
    
    // Merge existing and new images
    const allImages = [...existingImages, ...imageUrls];
    console.log(`[UPDATE ITEM] Total images after merge: ${allImages.length}`);
    
    // Update the item in Firestore
    const updatedItem = {
      ...item.toFirebase(),
      images: allImages,
      mainImage: allImages[0] || '',
    };
    
    console.log(`[UPDATE ITEM] Updating item in Firestore...`);
    await updateDoc(docRef, updatedItem);
    console.log(`[UPDATE ITEM] Item updated successfully`);
  } catch (error) {
    console.error(`[UPDATE ITEM ERROR] Error updating item:`, error);
    console.error(`[UPDATE ITEM ERROR] Error name: ${error.name}, message: ${error.message}`);
    console.error(`[UPDATE ITEM ERROR] Error code: ${error.code || 'N/A'}, stack: ${error.stack || 'N/A'}`);
    throw error;
  }
};

/**
 * Delete an item
 * @param {string} id - The item ID
 * @returns {Promise<void>}
 */
export const deleteItem = async (id) => {
  try {
    const docRef = doc(db, ITEMS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

/**
 * Get featured items
 * @param {number} limit - Maximum number of items to return
 * @returns {Promise<ItemModel[]>} - Array of featured items
 */
export const getFeaturedItems = async (limitCount = 8) => {
  try {
    const q = query(
      collection(db, ITEMS_COLLECTION),
      where('featured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ItemModel.fromFirebase(doc.id, doc.data()));
  } catch (error) {
    console.error('Error getting featured items:', error);
    throw error;
  }
};

/**
 * Get items by category
 * @param {string} category - The category to filter by
 * @returns {Promise<ItemModel[]>} - Array of items in the category
 */
export const getItemsByCategory = async (category) => {
  try {
    const q = query(
      collection(db, ITEMS_COLLECTION),
      where('category', '==', category)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ItemModel.fromFirebase(doc.id, doc.data()));
  } catch (error) {
    console.error('Error getting items by category:', error);
    throw error;
  }
};

/**
 * Get items by gender
 * @param {string} gender - The gender to filter by (men, women, unisex)
 * @returns {Promise<ItemModel[]>} - Array of items for the gender
 */
export const getItemsByGender = async (gender) => {
  try {
    const q = query(
      collection(db, ITEMS_COLLECTION),
      where('gender', '==', gender)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ItemModel.fromFirebase(doc.id, doc.data()));
  } catch (error) {
    console.error('Error getting items by gender:', error);
    throw error;
  }
};

/**
 * Get items by header category
 * @param {string} headerCategory - The header category to filter by (prom, hoco, wedding, etc.)
 * @returns {Promise<ItemModel[]>} - Array of items in the header category
 */
export const getItemsByHeaderCategory = async (headerCategory) => {
  try {
    const q = query(
      collection(db, ITEMS_COLLECTION),
      where('headerCategory', '==', headerCategory)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ItemModel.fromFirebase(doc.id, doc.data()));
  } catch (error) {
    console.error(`Error getting items by header category ${headerCategory}:`, error);
    throw error;
  }
};

/**
 * Get items by sub-header category
 * @param {string} headerCategory - The header category (prom, hoco, wedding, etc.)
 * @param {string} subHeaderCategory - The sub-header category to filter by
 * @returns {Promise<ItemModel[]>} - Array of items in the sub-header category
 */
export const getItemsBySubHeaderCategory = async (headerCategory, subHeaderCategory) => {
  try {
    const q = query(
      collection(db, ITEMS_COLLECTION),
      where('headerCategory', '==', headerCategory),
      where('subHeaderCategory', '==', subHeaderCategory)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ItemModel.fromFirebase(doc.id, doc.data()));
  } catch (error) {
    console.error(`Error getting items by sub-header category ${headerCategory}/${subHeaderCategory}:`, error);
    throw error;
  }
};

/**
 * Get items with complex filtering (great for your website!)
 * @param {Object} filters - Filter object
 * @param {string} filters.headerCategory - Header category filter
 * @param {string} filters.subHeaderCategory - Sub-header category filter
 * @param {string} filters.gender - Gender filter
 * @param {boolean} filters.featured - Featured filter
 * @param {number} filters.maxPrice - Maximum price filter
 * @param {number} filters.limit - Limit results
 * @returns {Promise<ItemModel[]>} - Array of filtered items
 */
export const getItemsWithFilters = async (filters = {}) => {
  try {
    let q = collection(db, ITEMS_COLLECTION);
    const constraints = [];
    
    if (filters.headerCategory) {
      constraints.push(where('headerCategory', '==', filters.headerCategory));
    }
    if (filters.subHeaderCategory) {
      constraints.push(where('subHeaderCategory', '==', filters.subHeaderCategory));
    }
    if (filters.gender) {
      constraints.push(where('gender', '==', filters.gender));
    }
    if (filters.featured !== undefined) {
      constraints.push(where('featured', '==', filters.featured));
    }
    if (filters.maxPrice) {
      constraints.push(where('price', '<=', filters.maxPrice));
    }
    
    // Add ordering and limit
    constraints.push(orderBy('createdAt', 'desc'));
    if (filters.limit) {
      constraints.push(limit(filters.limit));
    }
    
    q = query(q, ...constraints);
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ItemModel.fromFirebase(doc.id, doc.data()));
  } catch (error) {
    console.error('Error getting items with filters:', error);
    throw error;
  }
};


