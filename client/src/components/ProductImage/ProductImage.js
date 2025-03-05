import React, { useState } from 'react';
import './ProductImage.css';

const ProductImage = ({ imageUrl, alt, className = '' }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const fullImageUrl = imageUrl
    ? imageUrl.startsWith('http')
      ? imageUrl
      : imageUrl.startsWith('uploads/')
        ? `${serverUrl}/${imageUrl}`
        : imageUrl.startsWith('/')
          ? `${serverUrl}${imageUrl}`
          : `${serverUrl}/uploads/${imageUrl}`
    : null;
  const placeholderUrl = '/placeholder.png';

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleImageError = (e) => {
    console.error('Image loading error:', e);
    setError(true);
    setLoading(false);
  };

  if (!imageUrl) {
    return (
      <div className={`product-image-container ${className}`}>
        <img
          src={placeholderUrl}
          alt="Product placeholder"
          className="product-image"
        />
      </div>
    );
  }

  return (
    <div className={`product-image-container ${className}`}>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      <img
        src={error ? placeholderUrl : fullImageUrl}
        alt={alt || 'Product image'}
        className={`product-image ${loading ? 'loading' : ''} ${error ? 'error' : ''}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default ProductImage;