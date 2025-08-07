import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { ItemModel } from '../models/ItemModel';

// Sample image URLs from your Firebase Storage
const SAMPLE_IMAGES = [
  'https://firebasestorage.googleapis.com/v0/b/hola-fashion.firebasestorage.app/o/static%2Fimage00001_900x.webp?alt=media&token=d773a3bf-97ca-425f-814e-542f010e8c73',
  'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
  'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg',
  'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg'
];

// Sample items data matching exact categories from ItemModel
const SAMPLE_ITEMS = [
  // PROM items
  {
    name: 'Elegant Red Prom Dress',
    description: 'Stunning red evening gown perfect for prom night',
    price: 299.99,
    category: 'prom-dresses',
    headerCategory: 'prom',
    subHeaderCategory: 'long-prom',
    gender: 'women',
    featured: true,
    sizes: ['S', 'M', 'L'],
    colors: ['Red'],
    brand: 'Rallina'
  },
  {
    name: 'Royal Blue Long Prom Gown',
    description: 'Elegant blue gown with sequin details',
    price: 349.99,
    category: 'prom-dresses',
    headerCategory: 'prom',
    subHeaderCategory: 'long-prom',
    gender: 'women',
    featured: false,
    sizes: ['M', 'L', 'XL'],
    colors: ['Blue'],
    brand: 'Rallina'
  },
  {
    name: 'Short Sparkly Prom Dress',
    description: 'Glamorous short dress with sparkle details',
    price: 199.99,
    category: 'prom-dresses',
    headerCategory: 'prom',
    subHeaderCategory: 'short-prom',
    gender: 'women',
    featured: true,
    sizes: ['XS', 'S', 'M'],
    colors: ['Silver'],
    brand: 'Rallina'
  },
  {
    name: 'Plus Size Prom Gown',
    description: 'Beautiful plus size prom dress',
    price: 279.99,
    category: 'prom-dresses',
    headerCategory: 'prom',
    subHeaderCategory: 'plus-size-prom',
    gender: 'women',
    featured: false,
    sizes: ['XL', 'XXL', 'XXXL'],
    colors: ['Purple'],
    brand: 'Rallina'
  },

  // HOCO items
  {
    name: 'Cute Pink Short Homecoming Dress',
    description: 'Sweet pink dress perfect for homecoming',
    price: 159.99,
    category: 'homecoming-dresses',
    headerCategory: 'hoco',
    subHeaderCategory: 'short-hoco',
    gender: 'women',
    featured: true,
    sizes: ['S', 'M', 'L'],
    colors: ['Pink'],
    brand: 'Rallina'
  },
  {
    name: 'Navy Blue Long Homecoming Dress',
    description: 'Elegant navy blue long homecoming dress',
    price: 179.99,
    category: 'homecoming-dresses',
    headerCategory: 'hoco',
    subHeaderCategory: 'long-hoco',
    gender: 'women',
    featured: false,
    sizes: ['S', 'M', 'L'],
    colors: ['Navy'],
    brand: 'Rallina'
  },
  {
    name: 'Plus Size Homecoming Dress',
    description: 'Beautiful plus size homecoming dress',
    price: 189.99,
    category: 'homecoming-dresses',
    headerCategory: 'hoco',
    subHeaderCategory: 'plus-size-hoco',
    gender: 'women',
    featured: false,
    sizes: ['XL', 'XXL'],
    colors: ['Burgundy'],
    brand: 'Rallina'
  },

  // WEDDING items
  {
    name: 'Classic White Wedding Dress',
    description: 'Beautiful white wedding gown with lace details',
    price: 899.99,
    category: 'wedding-dresses',
    headerCategory: 'wedding',
    subHeaderCategory: 'wedding-dresses',
    gender: 'women',
    featured: true,
    sizes: ['S', 'M', 'L'],
    colors: ['White'],
    brand: 'Rallina'
  },
  {
    name: 'Ivory Bridal Gown',
    description: 'Elegant ivory wedding dress with train',
    price: 1199.99,
    category: 'wedding-dresses',
    headerCategory: 'wedding',
    subHeaderCategory: 'wedding-dresses',
    gender: 'women',
    featured: true,
    sizes: ['M', 'L', 'XL'],
    colors: ['Beige'],
    brand: 'Rallina'
  },
  {
    name: 'Wedding Veil Set',
    description: 'Beautiful wedding accessories set',
    price: 149.99,
    category: 'accessories',
    headerCategory: 'wedding',
    subHeaderCategory: 'wedding-accessories',
    gender: 'women',
    featured: false,
    sizes: ['One Size'],
    colors: ['White'],
    brand: 'Rallina'
  },

  // WEDDING GUEST items
  {
    name: 'Elegant Wedding Guest Dress',
    description: 'Perfect dress for wedding guests',
    price: 129.99,
    category: 'wedding-guest-dresses',
    headerCategory: 'wedding-guest',
    subHeaderCategory: 'guest-dresses',
    gender: 'women',
    featured: false,
    sizes: ['S', 'M', 'L'],
    colors: ['Navy'],
    brand: 'Rallina'
  },

  // BRIDESMAID items
  {
    name: 'Blush Pink Bridesmaid Dress',
    description: 'Beautiful bridesmaid dress in blush pink',
    price: 179.99,
    category: 'bridesmaid-dresses',
    headerCategory: 'bridesmaid',
    subHeaderCategory: 'bridesmaid-dresses',
    gender: 'women',
    featured: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Pink'],
    brand: 'Rallina'
  },

  // MOTHER OF BRIDE items
  {
    name: 'Sophisticated Mother of Bride Dress',
    description: 'Elegant dress for mother of the bride',
    price: 249.99,
    category: 'mother-bride-dresses',
    headerCategory: 'mother-of-bride',
    subHeaderCategory: 'mother-dresses',
    gender: 'women',
    featured: false,
    sizes: ['M', 'L', 'XL'],
    colors: ['Navy'],
    brand: 'Rallina'
  },

  // QUINCE items
  {
    name: 'Royal Quinceanera Dress',
    description: 'Stunning quinceanera dress for special celebration',
    price: 599.99,
    category: 'quinceanera-dresses',
    headerCategory: 'quince',
    subHeaderCategory: 'quince-dresses',
    gender: 'women',
    featured: true,
    sizes: ['S', 'M', 'L'],
    colors: ['Purple'],
    brand: 'Rallina'
  },

  // FORMAL items
  {
    name: 'Black Evening Gown',
    description: 'Elegant evening gown for formal events',
    price: 399.99,
    category: 'evening-gowns',
    headerCategory: 'formal',
    subHeaderCategory: 'evening-gowns',
    gender: 'women',
    featured: true,
    sizes: ['S', 'M', 'L'],
    colors: ['Black'],
    brand: 'Rallina'
  },
  {
    name: 'Gold Cocktail Dress',
    description: 'Glamorous cocktail dress for formal occasions',
    price: 189.99,
    category: 'cocktail-dresses',
    headerCategory: 'formal',
    subHeaderCategory: 'cocktail-dresses',
    gender: 'women',
    featured: false,
    sizes: ['S', 'M', 'L'],
    colors: ['Gold'],
    brand: 'Rallina'
  }
];

/**
 * Get a random image URL from the sample images
 */
const getRandomImage = () => {
  return SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)];
};

/**
 * Bulk upload sample items to Firebase
 * This function creates sample items across all categories and header categories
 */
export const bulkUploadSampleItems = async () => {
  try {
    console.log('🚀 Starting bulk upload of sample items...');
    
    const uploadPromises = SAMPLE_ITEMS.map(async (itemData, index) => {
      try {
        // Create ItemModel instance with random image
        const randomImage = getRandomImage();
        const item = new ItemModel({
          id: '', // id will be auto-generated
          name: itemData.name,
          description: itemData.description,
          price: itemData.price,
          discountPrice: 0,
          gender: itemData.gender,
          category: itemData.category,
          subCategory: '',
          headerCategory: itemData.headerCategory,
          subHeaderCategory: itemData.subHeaderCategory,
          sizes: itemData.sizes,
          colors: itemData.colors,
          images: [randomImage],
          mainImage: randomImage,
          stock: 10,
          featured: itemData.featured,
          tags: [],
          brand: itemData.brand,
          material: '',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Convert to Firebase format
        const firebaseData = item.toFirebase();
        
        // Add to Firestore
        const docRef = await addDoc(collection(db, 'items'), firebaseData);
        
        console.log(`✅ Uploaded item ${index + 1}/${SAMPLE_ITEMS.length}: ${itemData.name} (ID: ${docRef.id})`);
        
        return { success: true, id: docRef.id, name: itemData.name };
      } catch (error) {
        console.error(`❌ Failed to upload item ${index + 1}: ${itemData.name}`, error);
        return { success: false, name: itemData.name, error: error.message };
      }
    });

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`\n🎉 Bulk upload completed!`);
    console.log(`✅ Successfully uploaded: ${successful} items`);
    console.log(`❌ Failed uploads: ${failed} items`);
    
    if (failed > 0) {
      console.log('Failed items:', results.filter(r => !r.success));
    }
    
    return {
      success: true,
      total: SAMPLE_ITEMS.length,
      successful,
      failed,
      results
    };
    
  } catch (error) {
    console.error('💥 Bulk upload failed:', error);
    throw error;
  }
};

/**
 * Clear all items from Firebase (use with caution!)
 */
export const clearAllItems = async () => {
  try {
    console.log('🗑️ Clearing all items from Firebase...');
    
    // This would require additional implementation to fetch and delete all items
    // For now, just log a warning
    console.warn('⚠️ Clear function not implemented yet. Please delete items manually from Firebase console if needed.');
    
    return { success: false, message: 'Clear function not implemented' };
  } catch (error) {
    console.error('Error clearing items:', error);
    throw error;
  }
};
