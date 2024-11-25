// src/components/CheckoutPage.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import "../pages/CheckoutPage.css";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();

  const { productId, quantity } = location.state || {}; // Product details for guest checkout

  const [address, setAddress] = useState(user?.shippingInfo?.address || "");
  const [city, setCity] = useState(user?.shippingInfo?.city || "");
  const [state, setState] = useState(user?.shippingInfo?.state || "");
  const [zipCode, setZipCode] = useState(user?.shippingInfo?.zipcode || "");
  const [cardNumber, setCardNumber] = useState(
    user?.savedPaymentInfo?.cardNumber || ""
  );
  const [cardHolderName, setCardHolderName] = useState(
    user?.savedPaymentInfo?.cardHolderName || ""
  );
  const [expiryDate, setExpiryDate] = useState(
    user?.savedPaymentInfo?.expiryDate || ""
  );
  const [cvv, setCvv] = useState(user?.savedPaymentInfo?.cvv || "");
  const [deliveryDate, setDeliveryDate] = useState("");

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

  const handleConfirmPurchase = async () => {
    if (
      !user &&
      (!address ||
        !city ||
        !state ||
        !zipCode ||
        !cardNumber ||
        !cardHolderName ||
        !expiryDate ||
        !cvv)
    ) {
      alert("Please enter all required information.");
      return;
    }

    try {
      if (user) {
        // Authenticated user purchase
        const token = localStorage.getItem("token");

        // Loop through cart items and send the purchase request for each item
        for (const item of cartItems) {
          if (!item.size || !item.quantity) {
            console.error("Missing size or quantity in cart item:", item);
            alert(
              `Error: Item "${
                item.productDetail?.name || item.productId
              }" is missing size or quantity.`
            );
            return;
          }

          console.log("Sending Payload for Authenticated Purchase:", {
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
          });

          await axios.post(
            `http://localhost:3001/purchase/${item.productId}`,
            {
              size: item.size,
              quantity: item.quantity,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      } else if (productId) {
        // Guest checkout for a single product
        console.log("Sending Payload for Guest Checkout:", {
          productId,
          quantity,
          shippingInfo: { address, city, state, zipcode: zipCode },
          paymentInfo: { cardNumber, cardHolderName, expiryDate, cvv },
        });

        await axios.post(`http://localhost:3001/purchase/${productId}/guest`, {
          quantity,
          shippingInfo: { address, city, state, zipcode: zipCode },
          paymentInfo: { cardNumber, cardHolderName, expiryDate, cvv },
        });
      }

      alert(
        `Purchase confirmed! Your order will be delivered on ${deliveryDate}.`
      );
      clearCart(); // Clear the cart after successful purchase
      navigate("/"); // Redirect to homepage
    } catch (error) {
      console.error("Error confirming purchase:", error);
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map((err) => err.msg)
          .join(", ");
        alert(`Error: ${errorMessages}`);
      } else {
        alert("There was an error processing your purchase. Please try again.");
      }
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-form">
        <h1>Checkout</h1>
        {!user && (
          <>
            <h2>Shipping Information</h2>
            <input
              type="text"
              placeholder="Address"
              className="checkout-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="City"
              className="checkout-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="State"
              className="checkout-input"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Zip Code"
              className="checkout-input"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
            />

            <h2>Payment Information</h2>
            <input
              type="text"
              placeholder="Card Number"
              className="checkout-input"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Card Holder Name"
              className="checkout-input"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Expiry Date (MM/YY)"
              className="checkout-input"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="CVV"
              className="checkout-input"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              required
            />
          </>
        )}

        <h3>Estimated Delivery Date: {deliveryDate}</h3>
        <button className="checkout-button" onClick={handleConfirmPurchase}>
          Confirm Purchase
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
