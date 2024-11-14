import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useProduct } from "../contexts/ProductContext";
import { useCart } from "../contexts/CartContext";
import axios from "axios";
import "./ProductDetail.css"; // Import the CSS file for styling

const ProductDetail = () => {
  const { productId } = useParams();
  const { useProductDetail, useProductReviews } = useProduct();
  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useProductDetail(productId);
  const { data: reviewsData, refetch } = useProductReviews(productId);

  const reviews = reviewsData?.reviews || [];
  const averageRating = reviewsData?.averageRating || 0;

  const token = localStorage.getItem("token");

  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewError, setReviewError] = useState(null);

  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    alert("Added to cart!");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError(null);

    if (!token) {
      alert("Please log in to submit a review.");
      return;
    }

    try {
      await axios.post(
        `http://localhost:3001/products/${productId}/review`,
        {
          rating: reviewRating,
          comment: reviewComment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Review submitted successfully!");
      setReviewComment("");
      setReviewRating(0);
      refetch(); // Refetch reviews to update the list
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewError("Failed to submit review. Please try again later.");
    }
  };

  if (productLoading) return <p>Loading...</p>;
  if (productError) return <p>Error loading product details.</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div className="product-detail">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="product-detail-image"
      />
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>

      <div className="reviews-section">
        <h3>Customer Reviews</h3>
        <p>Average Rating: {averageRating.toFixed(1)} / 5</p>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="review-item">
              <p>
                <strong>Rating:</strong> {review.rating} / 5
              </p>
              <p>{review.comment}</p>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>

      <form onSubmit={handleReviewSubmit} className="review-form">
        <h4>Leave a Review</h4>
        <textarea
          placeholder="Write your review here..."
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          required
        ></textarea>
        <input
          type="number"
          min="1"
          max="5"
          placeholder="Rating (1-5)"
          value={reviewRating}
          onChange={(e) => setReviewRating(Number(e.target.value))}
          required
        />
        {reviewError && <p style={{ color: "red" }}>{reviewError}</p>}
        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
};

export default ProductDetail;
