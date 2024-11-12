import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [city, setCity] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Luhn Algorithm to validate credit card number
  const validateCardNumber = (number) => {
    let sum = 0;
    let shouldDouble = false;
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i]);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  // Validate expiry date (format: MM/YY)
  const validateExpiryDate = (date) => {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(date)) return false;
    const [month, year] = date.split("/").map(Number);
    const currentYear = new Date().getFullYear() % 100; // Last two digits of current year
    const currentMonth = new Date().getMonth() + 1;
    return (
      year > currentYear || (year === currentYear && month >= currentMonth)
    );
  };

  // Validate CVV (3 or 4 digits)
  const validateCvv = (cvv) => /^\d{3,4}$/.test(cvv);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    const newErrors = {};
    if (!validateCardNumber(cardNumber))
      newErrors.cardNumber = "Invalid card number.";
    if (!validateExpiryDate(expiryDate))
      newErrors.expiryDate = "Invalid expiry date.";
    if (!validateCvv(cvv)) newErrors.cvv = "Invalid CVV.";
    setErrors(newErrors);

    // If no errors, proceed with registration
    if (Object.keys(newErrors).length === 0) {
      try {
        await register({
          email,
          password,
          username,
          savedPaymentInfo: {
            cardNumber,
            cardHolderName,
            expiryDate,
            cvv,
          },
          shippingInfo: {
            address,
            state,
            zipcode,
            city,
          },
        });
        navigate("/");
      } catch (error) {
        console.error("Registration failed:", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Card Number"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
        required
      />
      {errors.cardNumber && <p style={{ color: "red" }}>{errors.cardNumber}</p>}
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
      {errors.expiryDate && <p style={{ color: "red" }}>{errors.expiryDate}</p>}
      <input
        type="text"
        placeholder="CVV"
        value={cvv}
        onChange={(e) => setCvv(e.target.value)}
        required
      />
      {errors.cvv && <p style={{ color: "red" }}>{errors.cvv}</p>}
      <input
        type="text"
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
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
        placeholder="Zipcode"
        value={zipcode}
        onChange={(e) => setZipcode(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        required
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterPage;
