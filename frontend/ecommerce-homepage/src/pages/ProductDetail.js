// src/components/ProductDetail.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProduct } from "../contexts/ProductContext";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { FaStar, FaRegStar } from "react-icons/fa"; // Importing star icons
import "./ProductDetail.css";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { useProductDetail, useProductReviews } = useProduct();
  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useProductDetail(productId);
  const { data: reviewsData, refetch } = useProductReviews(productId);
  const { user } = useAuth();
  const { addToCart } = useCart();

  const reviews = reviewsData?.reviews || [];
  const averageRating = reviewsData?.averageRating || 0;

  const token = localStorage.getItem("token");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0); // State for hover effect
  const [reviewError, setReviewError] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showGuestCheckout, setShowGuestCheckout] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);

  // Guest checkout information states
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateField, setStateField] = useState(""); // Renamed to avoid conflict with React's state
  const [zipCode, setZipCode] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [checkoutError, setCheckoutError] = useState(null);

  // Generate delivery date and total price on component mount
  useEffect(() => {
    const generateRandomDeliveryDate = () => {
      const today = new Date();
      const randomDays = Math.floor(Math.random() * 5) + 3;
      const delivery = new Date(today);
      delivery.setDate(today.getDate() + randomDays);
      return delivery.toDateString();
    };
    setDeliveryDate(generateRandomDeliveryDate());

    if (product) {
      setTotalPrice(product.price); // Set total price based on product price
    }
  }, [product]);

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

    if (reviewRating === 0) {
      setReviewError("Please select a rating.");
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
      setHoverRating(0);
      refetch();
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewError("Failed to submit review. Please try again later.");
    }
  };

  const handleBuyNowClick = () => {
    if (user) {
      setShowConfirmModal(true);
    } else {
      setShowGuestCheckout(true);
    }
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
        navigate("/"); // Redirect to homepage after purchase
      } catch (error) {
        console.error("Error purchasing product:", error);
        alert("There was an error processing your purchase. Please try again.");
      }
    }
  };

  const handleGuestCheckout = async () => {
    setCheckoutError(null);

    if (
      !address ||
      !city ||
      !stateField ||
      !zipCode ||
      !cardNumber ||
      !cardHolderName ||
      !expiryDate ||
      !cvv
    ) {
      setCheckoutError("Please fill out all required fields.");
      return;
    }

    try {
      await axios.post(`http://localhost:3001/purchase/${productId}/guest`, {
        quantity: 1,
        shippingInfo: { address, city, state: stateField, zipcode: zipCode },
        paymentInfo: { cardNumber, cardHolderName, expiryDate, cvv },
      });
      alert(
        `Purchase confirmed! Your order will be delivered on ${deliveryDate}.`
      );
      setShowGuestCheckout(false);
      navigate("/"); // Redirect to homepage after purchase
    } catch (error) {
      console.error("Error confirming guest purchase:", error);
      if (error.response && error.response.data.errors) {
        const cardError = error.response.data.errors.find(
          (err) => err.msg === "Invalid credit card number."
        );
        if (cardError) {
          setCheckoutError("Invalid credit card number.");
        } else {
          setCheckoutError(
            "There was an error processing your purchase. Please try again."
          );
        }
      } else {
        setCheckoutError(
          "There was an error processing your purchase. Please try again."
        );
      }
    }
  };

  const cancelGuestCheckout = () => {
    setShowGuestCheckout(false);
  };

  // Helper function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} color="#ffc107" />); // Filled star
      } else {
        stars.push(<FaRegStar key={i} color="#e4e5e9" />); // Outlined star
      }
    }
    return stars;
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
      <p className="price">Price: ${product.price}</p>
      <div className="buttons">
        <button onClick={handleAddToCart} className="add-to-cart-button">
          Add to Cart
        </button>
        <button onClick={handleBuyNowClick} className="buy-now-button">
          Buy Now
        </button>
      </div>

      {/* Confirmation Modal for Authenticated Users */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Purchase</h3>
            <p>Total: ${totalPrice}</p>
            <p>Estimated Delivery Date: {deliveryDate}</p>
            <div className="modal-buttons">
              <button onClick={confirmPurchase} className="confirm-button">
                Confirm
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Checkout Modal */}
      {showGuestCheckout && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Guest Checkout</h3>
            <p>Total: ${totalPrice}</p>
            <p>Estimated Delivery Date: {deliveryDate}</p>

            <h4>Shipping Information</h4>
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="State"
              value={stateField}
              onChange={(e) => setStateField(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Zip Code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
            />

            <h4>Payment Information</h4>
            <input
              type="text"
              placeholder="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Card Holder Name"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Expiry Date (MM/YY)"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              required
            />

            {checkoutError && <p className="error-message">{checkoutError}</p>}

            <div className="modal-buttons">
              <button onClick={handleGuestCheckout} className="confirm-button">
                Confirm Purchase
              </button>
              <button onClick={cancelGuestCheckout} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="reviews-section">
        <h3>Customer Reviews</h3>
        <div className="average-rating">
          <span className="rating-number">{averageRating.toFixed(1)}</span>
          <div className="stars">{renderStars(Math.round(averageRating))}</div>
          <span className="rating-text">out of 5</span>
        </div>
        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} className="review-item">
                <div className="review-header">
                  <div className="review-stars">{renderStars(review.rating)}</div>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))
          ) : (
            <p>No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>

      {/* Review Form */}
      <form onSubmit={handleReviewSubmit} className="review-form">
        <h4>Leave a Review</h4>
        {user ? (
          <div className="rating-input">
            <span>Your Rating:</span>
            <div className="stars-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setReviewRating(star)}
                  onMouseOver={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ cursor: "pointer" }}
                  aria-label={`${star} Star`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setReviewRating(star);
                  }}
                >
                  {star <= (hoverRating || reviewRating) ? (
                    <FaStar color="#ffc107" />
                  ) : (
                    <FaRegStar color="#e4e5e9" />
                  )}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p>Please log in to leave a review.</p>
        )}
        <textarea
          placeholder="Write your review here..."
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          required
          disabled={!user}
        ></textarea>
        {reviewError && <p className="error-message">{reviewError}</p>}
        <button type="submit" disabled={!user}>
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default ProductDetail;
