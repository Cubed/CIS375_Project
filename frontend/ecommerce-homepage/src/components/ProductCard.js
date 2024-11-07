// src/components/ProductCard.js
import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  // Function to render stars based on rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return (
      <>
        {Array(fullStars)
          .fill("★")
          .map((star, index) => (
            <span key={`full-${index}`} className="star full">
              {star}
            </span>
          ))}
        {halfStar === 1 && <span className="star half">★</span>}
        {Array(emptyStars)
          .fill("☆")
          .map((star, index) => (
            <span key={`empty-${index}`} className="star empty">
              {star}
            </span>
          ))}
      </>
    );
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-image"
        />
        <h3 className="product-name">{product.name}</h3>
      </Link>
      <div className="product-rating">{renderStars(product.rating || 0)}</div>
    </div>
  );
};

export default ProductCard;
