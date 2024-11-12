// src/components/ProductCard.js
import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import "../App.css";

const ProductCard = ({ product }) => {
  // Function to fetch reviews and calculate the average rating
  const fetchReviews = async () => {
    const response = await axios.get(
      `http://localhost:3001/products/${product._id}/reviews`
    );
    const reviews = response.data;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      return totalRating / reviews.length;
    }
    return 0;
  };

  // Use React Query to fetch reviews
  const { data: averageRating = 0, error } = useQuery({
    queryKey: ["reviews", product._id],
    queryFn: fetchReviews,
  });

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
