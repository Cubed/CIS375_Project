// src/components/CheckoutPage.js
import React, { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const { cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(user?.shippingInfo?.address || "");
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

  const handleConfirmPurchase = () => {
    if (
      !user &&
      (!address ||
        !zipCode ||
        !cardNumber ||
        !cardHolderName ||
        !expiryDate ||
        !cvv)
    ) {
      alert("Please enter all required information.");
      return;
    }

    // Simulate successful purchase
    alert(
      `Purchase confirmed! Your order will be delivered on ${deliveryDate}.`
    );

    // Clear the cart after successful purchase
    clearCart();

    // Redirect to the homepage after purchase
    navigate("/");
  };

  return (
    <div>
      <h1>Checkout</h1>
      <p>Total: ${Number(cartTotal).toFixed(2)}</p>

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
            placeholder="Zip Code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            required
          />
        </>
      ) : (
        <>
          <p>Address: {user.shippingInfo.address || "1234 Example St"}</p>
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
