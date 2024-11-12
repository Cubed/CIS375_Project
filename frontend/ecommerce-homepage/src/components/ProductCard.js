// src/components/ProductCard.js
import React from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { useProduct } from "../contexts/ProductContext"; // Import the Product context

const ProductCard = ({ product }) => {
  const { useProductReviews } = useProduct(); // Get the custom hook from ProductContext
  const { data: averageRating = 0, error } = useProductReviews(product._id); // Fetch the average rating using React Query

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
      <div className="product-rating">
        {error ? <span>Error loading rating</span> : renderStars(averageRating)}
      </div>

      {/* Render tags if available */}
      <div className="product-tags">
        {product.tags && product.tags.length > 0 ? (
          product.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))
        ) : (
          <span className="no-tags">No Tags</span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
