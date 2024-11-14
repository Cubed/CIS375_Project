// src/components/CheckoutPage.js
import React, { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

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
    // Generate a random delivery date between 3 to 7 days from today
    const generateRandomDeliveryDate = () => {
      const today = new Date();
      const randomDays = Math.floor(Math.random() * 5) + 3; // Random number between 3 and 7
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
        // Authenticated user purchase for each item in the cart
        const token = localStorage.getItem("token");

        for (const item of cartItems) {
          await axios.post(
            `http://localhost:3001/purchase/${item.productId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      }

      // Simulate successful purchase
      alert(
        `Purchase confirmed! Your order will be delivered on ${deliveryDate}.`
      );

      // Clear the cart after successful purchase
      clearCart();

      // Redirect to the homepage after purchase
      navigate("/");
    } catch (error) {
      console.error("Error confirming purchase:", error);
      alert("There was an error processing your purchase. Please try again.");
    }
  };

  return (
    <div>
      <h1>Checkout</h1>

      <h2>Shipping Information</h2>
      {!user ? (
        <>
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
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Zip Code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            required
          />
        </>
      ) : (
        <>
          <p>Address: {user.shippingInfo.address || "1234 Example St"}</p>
          <p>City: {user.shippingInfo.city || "Sample City"}</p>
          <p>State: {user.shippingInfo.state || "Sample State"}</p>
          <p>Zip Code: {user.shippingInfo.zipcode || "00000"}</p>
        </>
      )}

      <h2>Payment Information</h2>
      {!user ? (
        <>
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
        </>
      ) : (
        <>
          <p>
            Card Number: **** **** ****{" "}
            {user.savedPaymentInfo.cardNumber.slice(-4)}
          </p>
          <p>Card Holder: {user.savedPaymentInfo.cardHolderName}</p>
        </>
      )}

      <h3>Estimated Delivery Date: {deliveryDate}</h3>

      <button onClick={handleConfirmPurchase}>Confirm Purchase</button>
    </div>
  );
};

export default CheckoutPage;
