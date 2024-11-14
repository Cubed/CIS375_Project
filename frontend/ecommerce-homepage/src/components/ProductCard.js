// src/components/ProductCard.js
import React from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { useProduct } from "../contexts/ProductContext";

const ProductCard = ({ product }) => {
  const { useProductReviews } = useProduct();
  const { data: reviewsData, error } = useProductReviews(product._id);

  const averageRating = reviewsData?.averageRating || 0;

  // Function to render stars based on rating
  const renderStars = (rating) => {
    const stars = Array(5).fill("☆"); // Initialize an array with five empty stars

    // Fill the array with full stars based on the rating
    for (let i = 0; i < Math.floor(rating); i++) {
      stars[i] = "★";
    }

    return stars.map((star, index) => (
      <span key={index} className={`star ${star === "★" ? "full" : "empty"}`}>
        {star}
      </span>
    ));
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
      {/* Display the product price */}
      <p className="product-price">${product.price.toFixed(2)}</p>
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
