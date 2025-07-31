import React from 'react';
import './ItemCard.css';
import { FaEye, FaEdit, FaTrashAlt, FaStar } from 'react-icons/fa';
import { MdLocalOffer } from 'react-icons/md';

// Placeholder image URL
const PLACEHOLDER_IMAGE = 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg';

const ItemCard = ({ item, onEdit, onDelete }) => {
  // Calculate discount percentage if applicable
  const discountPercentage = item.discountPrice > 0 
    ? Math.round((1 - item.discountPrice/item.price) * 100) 
    : 0;

  return (
    <div className="item-card">
      <div className="item-card-image-container">
        <img 
          src={item.mainImage || PLACEHOLDER_IMAGE} 
          alt={item.name} 
          className="item-card-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = PLACEHOLDER_IMAGE;
          }}
        />
        {item.featured && (
          <span className="item-card-badge featured">
            <FaStar className="badge-icon" /> Featured
          </span>
        )}
        {item.discountPrice > 0 && (
          <span className="item-card-badge discount">
            <MdLocalOffer className="badge-icon" /> {discountPercentage}% OFF
          </span>
        )}
      </div>
      
      <div className="item-card-content">
        <h3 className="item-card-title">{item.name}</h3>
        
        <div className="item-card-price-container">
          <div className="item-card-price">
            {item.discountPrice > 0 ? (
              <>
                <span className="item-card-price-original">${item.price.toFixed(2)}</span>
                <span className="item-card-price-discount">${item.discountPrice.toFixed(2)}</span>
              </>
            ) : (
              <span className="item-card-price-regular">${item.price.toFixed(2)}</span>
            )}
          </div>
          <span className={`item-card-gender ${item.gender}`}>
            {item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}
          </span>
        </div>
        
        <p className="item-card-description">{item.description}</p>
        
        <div className="item-card-divider"></div>
        
        <div className="item-card-details">
          <div className="item-card-stock">
            <span className={`item-card-stock-badge ${
              item.stock > 10 ? 'high' : item.stock > 0 ? 'medium' : 'low'
            }`}>
              {item.stock}
            </span>
            <span className="item-card-stock-label">Stock</span>
          </div>
          
          <div className="item-card-sizes">
            {item.sizes.slice(0, 3).map((size) => (
              <span key={size} className="item-card-size">{size}</span>
            ))}
            {item.sizes.length > 3 && (
              <span className="item-card-size more">+{item.sizes.length - 3}</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="item-card-actions">
        <button className="item-card-action-btn view" title="View Details">
          <FaEye />
        </button>
        <button 
          className="item-card-action-btn edit" 
          title="Edit Item"
          onClick={() => onEdit(item)}
        >
          <FaEdit />
        </button>
        <button 
          className="item-card-action-btn delete" 
          title="Delete Item"
          onClick={() => onDelete(item.id)}
        >
          <FaTrashAlt />
        </button>
      </div>
    </div>
  );
};

export default ItemCard;