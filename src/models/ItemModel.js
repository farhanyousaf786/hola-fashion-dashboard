// Item model for clothing products
export class ItemModel {
  constructor({
    id = null,
    name = '',
    description = '',
    price = 0,
    discountPrice = 0,
    gender = '', // 'men', 'women', 'unisex'
    category = '',
    subCategory = '',
    sizes = [],
    colors = [],
    images = [],
    mainImage = '',
    stock = 0,
    featured = false,
    tags = [],
    brand = '',
    material = '',
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.discountPrice = discountPrice;
    this.gender = gender;
    this.category = category;
    this.subCategory = subCategory;
    this.sizes = sizes;
    this.colors = colors;
    this.images = images;
    this.mainImage = mainImage;
    this.stock = stock;
    this.featured = featured;
    this.tags = tags;
    this.brand = brand;
    this.material = material;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Helper method to convert to Firebase format
  toFirebase() {
    return {
      name: this.name,
      description: this.description,
      price: this.price,
      discountPrice: this.discountPrice,
      gender: this.gender,
      category: this.category,
      subCategory: this.subCategory,
      sizes: this.sizes,
      colors: this.colors,
      images: this.images,
      mainImage: this.mainImage,
      stock: this.stock,
      featured: this.featured,
      tags: this.tags,
      brand: this.brand,
      material: this.material,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Helper method to create from Firebase data
  static fromFirebase(id, data) {
    return new ItemModel({
      id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    });
  }
}

// Predefined categories for clothing items
export const ITEM_CATEGORIES = {
  MEN: [
    { value: 'shirts', label: 'Shirts' },
    { value: 't-shirts', label: 'T-Shirts' },
    { value: 'jeans', label: 'Jeans' },
    { value: 'pants', label: 'Pants' },
    { value: 'suits', label: 'Suits' },
    { value: 'jackets', label: 'Jackets' },
    { value: 'sweaters', label: 'Sweaters' },
    { value: 'hoodies', label: 'Hoodies' },
    { value: 'underwear', label: 'Underwear' },
    { value: 'socks', label: 'Socks' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'accessories', label: 'Accessories' }
  ],
  WOMEN: [
    { value: 'dresses', label: 'Dresses' },
    { value: 'tops', label: 'Tops' },
    { value: 'blouses', label: 'Blouses' },
    { value: 't-shirts', label: 'T-Shirts' },
    { value: 'jeans', label: 'Jeans' },
    { value: 'pants', label: 'Pants' },
    { value: 'skirts', label: 'Skirts' },
    { value: 'jackets', label: 'Jackets' },
    { value: 'sweaters', label: 'Sweaters' },
    { value: 'hoodies', label: 'Hoodies' },
    { value: 'lingerie', label: 'Lingerie' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'bags', label: 'Bags' },
    { value: 'accessories', label: 'Accessories' }
  ],
  UNISEX: [
    { value: 't-shirts', label: 'T-Shirts' },
    { value: 'hoodies', label: 'Hoodies' },
    { value: 'sweaters', label: 'Sweaters' },
    { value: 'jackets', label: 'Jackets' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'shoes', label: 'Shoes' }
  ]
};

// Common sizes for clothing
export const COMMON_SIZES = {
  LETTER: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  NUMERIC: ['30', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50'],
  SHOES_EU: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  SHOES_US: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12']
};

// Common colors for clothing
export const COMMON_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#008000' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Brown', hex: '#A52A2A' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Beige', hex: '#F5F5DC' }
];
