// src/components/ProductDetail.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProduct } from "../contexts/ProductContext";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { productId } = useParams();
  const { useProductDetail, useProductReviews } = useProduct();
  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useProductDetail(productId);
  const { data: reviewsData, refetch } = useProductReviews(productId);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const reviews = reviewsData?.reviews || [];
  const averageRating = reviewsData?.averageRating || 0;

  const token = localStorage.getItem("token");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewError, setReviewError] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");

  // Generate delivery date between 3 to 7 days from today
  useEffect(() => {
    const generateRandomDeliveryDate = () => {
      const today = new Date();
      const randomDays = Math.floor(Math.random() * 5) + 3;
      const delivery = new Date(today);
      delivery.setDate(today.getDate() + randomDays);
      return delivery.toDateString();
    };
    setDeliveryDate(generateRandomDeliveryDate());
  }, []);

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
      refetch();
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewError("Failed to submit review. Please try again later.");
    }
  };

  const handleBuyNowClick = () => {
    setShowConfirmModal(true); // Show the confirmation modal
  };

  const confirmPurchase = async () => {
    setShowConfirmModal(false);
    if (user) {
      try {
        await axios.post(
          `http://localhost:3001/purchase/${productId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert("Purchase successful!");
      } catch (error) {
        console.error("Error purchasing product:", error);
        alert("There was an error processing your purchase. Please try again.");
      }
    } else {
      navigate("/checkout", { state: { productId, quantity: 1 } });
    }
  };

  const cancelPurchase = () => {
    setShowConfirmModal(false); // Hide the confirmation modal
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
      <button onClick={handleBuyNowClick} className="buy-now-button">
        Buy Now
      </button>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Purchase</h3>
            <p>Are you sure you want to buy this product?</p>
            <p>Estimated Delivery Date: {deliveryDate}</p>
            <button onClick={confirmPurchase}>Confirm</button>
            <button onClick={cancelPurchase}>Cancel</button>
          </div>
        </div>
      )}

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
