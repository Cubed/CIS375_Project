// src/pages/AccountPage.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AccountPage.css";

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
  const [errors, setErrors] = useState({});

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

  const validateInputs = () => {
    const newErrors = {};

    // Expiry Date validation: format should be MM/YY
    const expiryDateRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryDateRegex.test(formData.expiryDate)) {
      newErrors.expiryDate = "Expiry date must be in MM/YY format.";
    } else {
      const [month, year] = formData.expiryDate.split("/").map(Number);
      const currentYear = new Date().getFullYear() % 100; // Get last two digits of the current year
      const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-based

      if (
        year < currentYear || // Year is in the past
        (year === currentYear && month <= currentMonth) || // Same year but earlier month
        (year === currentYear &&
          month === currentMonth + 1 &&
          currentMonth !== 12) // Same year and next month but invalid
      ) {
        newErrors.expiryDate =
          "Expiry date must be at least a month in the future.";
      }
    }

    // CVV validation: must be exactly 3 digits
    if (!/^\d{3}$/.test(formData.cvv)) {
      newErrors.cvv = "CVV must be exactly 3 digits.";
    }

    setErrors(newErrors); // Update the error state
    return Object.keys(newErrors).length === 0; // Return false if there are errors
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (validateInputs()) {
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
    } else {
      setMessage("Please fix the errors before submitting.");
    }
    setLoading(false);
  };

  return (
    <div className="account-container">
      <form className="account-form" onSubmit={handleSubmit}>
        <h2>Account Information</h2>
        {message && <p className="message">{message}</p>}
        {loading && <p className="message">Updating...</p>}

        <label>
          Username:
          <input
            className="account-form"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </label>
        <label>
          Email:
          <input
            className="account-form"
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
            className="account-form"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </label>
        <label>
          State:
          <input
            className="account-form"
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
          />
        </label>
        <label>
          City:
          <input
            className="account-form"
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </label>
        <label>
          Zipcode:
          <input
            className="account-form"
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
            className="account-form"
            type="text"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
          />
        </label>
        <label>
          Card Holder Name:
          <input
            className="account-form"
            type="text"
            name="cardHolderName"
            value={formData.cardHolderName}
            onChange={handleChange}
          />
        </label>
        <label>
          Expiry Date:
          <input
            className="account-form"
            type="text"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            placeholder="MM/YY"
          />
          {errors.expiryDate && <p className="error">{errors.expiryDate}</p>}
        </label>
        <label>
          CVV:
          <input
            className="account-form"
            type="text"
            name="cvv"
            value={formData.cvv}
            onChange={handleChange}
          />
          {errors.cvv && <p className="error">{errors.cvv}</p>}
        </label>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Updating..." : "Update Account"}
        </button>
      </form>
    </div>
  );
};

export default AccountPage;
