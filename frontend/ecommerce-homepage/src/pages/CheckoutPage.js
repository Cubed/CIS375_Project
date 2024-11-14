// src/pages/CheckoutPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Assuming you have AuthContext
import axios from "axios";
import "./CheckoutPage.css"; // Import the CSS for CheckoutPage

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth(); // Assuming AuthContext provides user and token
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    state: "",
    zipcode: "",
    city: "",
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardHolderName: "",
    expiryDate: "",
    cvv: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch cart items
  const getCartItems = () => {
    if (token) {
      // Authenticated user: Fetch from backend
      return JSON.parse(localStorage.getItem("cartItems")) || [];
      // Alternatively, implement a way to get cart items from context or backend
    } else {
      // Guest user: Fetch from localStorage
      return JSON.parse(localStorage.getItem("cartItems")) || [];
    }
  };

  const cartItems = getCartItems();
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.productDetails.price * item.quantity,
    0
  );

  const handleInputChange = (e, setState) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (token) {
        // Authenticated user: Process each cart item
        for (const item of cartItems) {
          await axios.post(
            `http://localhost:3001/purchase/${item.productId}`,
            { quantity: item.quantity },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
        alert("Purchase successful!");
      } else {
        // Guest user: Collect shipping and payment info
        for (const item of cartItems) {
          await axios.post("http://localhost:3001/purchase/guest", {
            productId: item.productId,
            quantity: item.quantity,
            shippingInfo,
            paymentInfo,
          });
        }
        alert("Purchase successful!");
      }

      // Clear cart after successful purchase
      localStorage.removeItem("cartItems");
      navigate("/"); // Redirect to homepage or order confirmation page
    } catch (error) {
      console.error("Error during checkout:", error);
      setSubmitError("Checkout failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0)
    return <p>Your cart is empty. Add some products before checking out.</p>;

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>
      <div className="checkout-summary">
        <h3>Order Summary</h3>
        {cartItems.map((item) => (
          <div key={item.productId} className="checkout-item">
            <p>{item.productDetails.name} x {item.quantity}</p>
            <p>${(item.productDetails.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
        <h3>Total: ${totalPrice.toFixed(2)}</h3>
      </div>

      <form onSubmit={handleSubmit} className="checkout-form">
        <h3>Shipping Information</h3>
        <div className="form-group">
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={shippingInfo.address}
            onChange={(e) => handleInputChange(e, setShippingInfo)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="state"
            placeholder="State"
            value={shippingInfo.state}
            onChange={(e) => handleInputChange(e, setShippingInfo)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="zipcode"
            placeholder="Zipcode"
            value={shippingInfo.zipcode}
            onChange={(e) => handleInputChange(e, setShippingInfo)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="city"
            placeholder="City"
            value={shippingInfo.city}
            onChange={(e) => handleInputChange(e, setShippingInfo)}
            required
          />
        </div>

        <h3>Payment Information</h3>
        <div className="form-group">
          <input
            type="text"
            name="cardNumber"
            placeholder="Card Number"
            value={paymentInfo.cardNumber}
            onChange={(e) => handleInputChange(e, setPaymentInfo)}
            required
            disabled={token} // Disable payment info for authenticated users if payment info is saved
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="cardHolderName"
            placeholder="Card Holder Name"
            value={paymentInfo.cardHolderName}
            onChange={(e) => handleInputChange(e, setPaymentInfo)}
            required
            disabled={token}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="expiryDate"
            placeholder="Expiry Date (MM/YY)"
            value={paymentInfo.expiryDate}
            onChange={(e) => handleInputChange(e, setPaymentInfo)}
            required
            disabled={token}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="cvv"
            placeholder="CVV"
            value={paymentInfo.cvv}
            onChange={(e) => handleInputChange(e, setPaymentInfo)}
            required
            disabled={token}
          />
        </div>

        {submitError && <p className="error-message">{submitError}</p>}

        <button type="submit" className="submit-checkout-button" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Confirm Purchase"}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
