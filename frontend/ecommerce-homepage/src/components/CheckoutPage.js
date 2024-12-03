// src/components/CheckoutPage.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

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

  const isCvvValid = (cvv) => /^\d{3}$/.test(cvv); // CVV must be exactly 3 digits
  const isExpiryDateValid = (expiryDate) => {
    const [year, month] = expiryDate.split("-");
    const expiry = new Date(year, month - 1); // Convert MM/YY to Date object
    const now = new Date();
    return expiry > now; // Expiry date must be in the future
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

    if (!isCvvValid(cvv)) {
      alert("Invalid CVV. It must be exactly 3 digits.");
      return;
    }

    if (!isExpiryDateValid(expiryDate)) {
      alert("Invalid Expiry Date. It must be in the future.");
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
    <div>
      <h1>Checkout</h1>
      {!user && (
        <>
          <h2>Shipping Information</h2>
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

          <h2>Payment Information</h2>
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
            type="month"
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
            maxLength="3"
            pattern="\d{3}"
            required
          />
        </>
      )}

      <h3>Estimated Delivery Date: {deliveryDate}</h3>
      <button onClick={handleConfirmPurchase}>Confirm Purchase</button>
    </div>
  );
};

export default CheckoutPage;
