// src/pages/AccountPage.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AccountPage = () => {
  const { user, updateAccount } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    address: "",
    state: "",
    city: "",
    zipcode: "",
    cardNumber: "",
    cardHolderName: "",
    expiryDate: "",
    cvv: "",
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Redirect to login page if user logs out
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Populate form data with existing user info
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        address: user.shippingInfo?.address || "",
        state: user.shippingInfo?.state || "",
        city: user.shippingInfo?.city || "",
        zipcode: user.shippingInfo?.zipcode || "",
        cardNumber: user.savedPaymentInfo?.cardNumber || "",
        cardHolderName: user.savedPaymentInfo?.cardHolderName || "",
        expiryDate: user.savedPaymentInfo?.expiryDate || "",
        cvv: user.savedPaymentInfo?.cvv || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const updates = {
      username: formData.username,
      email: formData.email,
      shippingInfo: {
        address: formData.address,
        state: formData.state,
        city: formData.city,
        zipcode: formData.zipcode,
      },
      savedPaymentInfo: {
        cardNumber: formData.cardNumber,
        cardHolderName: formData.cardHolderName,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
      },
    };

    const result = await updateAccount(updates);
    setMessage(result.message);
    setLoading(false);
  };

  return (
    <div>
      <h2>Account Information</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </label>

        <h3>Shipping Information</h3>
        <label>
          Address:
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </label>
        <label>
          State:
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
          />
        </label>
        <label>
          City:
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </label>
        <label>
          Zipcode:
          <input
            type="text"
            name="zipcode"
            value={formData.zipcode}
            onChange={handleChange}
          />
        </label>

        <h3>Payment Information</h3>
        <label>
          Card Number:
          <input
            type="text"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
          />
        </label>
        <label>
          Card Holder Name:
          <input
            type="text"
            name="cardHolderName"
            value={formData.cardHolderName}
            onChange={handleChange}
          />
        </label>
        <label>
          Expiry Date:
          <input
            type="text"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            placeholder="MM/YY"
          />
        </label>
        <label>
          CVV:
          <input
            type="text"
            name="cvv"
            value={formData.cvv}
            onChange={handleChange}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Account"}
        </button>
      </form>
    </div>
  );
};

export default AccountPage;
