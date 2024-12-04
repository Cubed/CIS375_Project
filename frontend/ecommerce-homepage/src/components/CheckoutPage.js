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
  const [errorMessage, setErrorMessage] = useState("");

  const isCvvValid = (cvv) => /^\d{3}$/.test(cvv);

  const isExpiryDateValid = (expiryDate) => {
    const [month, year] = expiryDate.split("/").map(Number); // Split by '/' for MM/YY format
    const currentYear = new Date().getFullYear() % 100; // Get the last two digits of the current year
    const currentMonth = new Date().getMonth() + 1; // Get the current month (1-based)

    if (!month || !year || month < 1 || month > 12 || year < currentYear) {
      return false;
    }

    if (year === currentYear && month <= currentMonth) {
      return false;
    }

    return true; // Expiry date is valid
  };

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
    setErrorMessage("");

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
      setErrorMessage("Please fill out all required information.");
      return;
    }

    if (!isCvvValid(cvv)) {
      setErrorMessage("Invalid CVV. It must be exactly 3 digits.");
      return;
    }

    if (!isExpiryDateValid(expiryDate)) {
      setErrorMessage(
        "Invalid Expiry Date. It must be a valid future date (MM/YY)."
      );
      return;
    }

    try {
      if (user) {
        const token = localStorage.getItem("token");

        for (const item of cartItems) {
          if (!item.size || !item.quantity) {
            alert(
              `Error: Item "${item.productId}" is missing size or quantity.`
            );
            return;
          }

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
        await axios.post(`http://localhost:3001/purchase/${productId}/guest`, {
          quantity,
          shippingInfo: { address, city, state, zipcode: zipCode },
          paymentInfo: { cardNumber, cardHolderName, expiryDate, cvv },
        });
      }

      alert(
        `Purchase confirmed! Your order will be delivered on ${deliveryDate}.`
      );
      clearCart();
      navigate("/");
    } catch (error) {
      console.error("Error confirming purchase:", error);
      setErrorMessage("There was an error processing your purchase.");
    }
  };

  return (
    <div className="checkout-container">
      <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
        <h1>Checkout</h1>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {!user && (
          <>
            <h2>Shipping Information</h2>
            <input
              className="checkout-form-input"
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <input
              className="checkout-form-input"
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <input
              className="checkout-form-input"
              type="text"
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
            <input
              className="checkout-form-input"
              type="text"
              placeholder="Zip Code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />

            <h2>Payment Information</h2>
            <input
              className="checkout-form-input"
              type="text"
              placeholder="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
            <input
              className="checkout-form-input"
              type="text"
              placeholder="Card Holder Name"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
            />
            <input
              className="checkout-form-input"
              type="text"
              placeholder="Expiry Date (MM/YY)"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
            <input
              className="checkout-form-input"
              type="text"
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              maxLength="3"
            />
          </>
        )}

        <h3>Estimated Delivery Date: {deliveryDate}</h3>
        <button className="checkout-button" onClick={handleConfirmPurchase}>
          Confirm Purchase
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
