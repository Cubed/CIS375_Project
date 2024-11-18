import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css"; // Import custom styles

const RegisterPage = () => {
  const { register, login } = useAuth();
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

  const validateInputs = () => {
    const newErrors = {};
    if (username.length < 3)
      newErrors.username = "Username must be at least 3 characters long.";
    if (!email.includes("@")) newErrors.email = "Invalid email address.";
    if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters long.";
    if (!/^\d{13,19}$/.test(cardNumber))
      newErrors.cardNumber = "Invalid card number format.";
    if (!cardHolderName)
      newErrors.cardHolderName = "Card holder name is required.";
    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiryDate))
      newErrors.expiryDate = "Invalid expiry date. Format: MM/YY";
    if (!/^\d{3,4}$/.test(cvv)) newErrors.cvv = "Invalid CVV.";
    if (!address) newErrors.address = "Address is required.";
    if (!state) newErrors.state = "State is required.";
    if (!/^\d{5}(-\d{4})?$/.test(zipcode))
      newErrors.zipcode = "Invalid zipcode.";
    if (!city) newErrors.city = "City is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateInputs()) {
      try {
        const result = await register({
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

        if (result.success) {
          await login(email, password);
          localStorage.removeItem("guestCart");
          navigate("/");
        } else if (result.errors) {
          setErrors(result.errors);
        } else if (result.message) {
          alert(result.message);
        }
      } catch (error) {
        console.error("Registration failed:", error);
      }
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Welcome to Our Platform</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {errors.username && <p className="error">{errors.username}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <p className="error">{errors.password}</p>}

        <h3>Payment Information</h3>
        <input
          type="text"
          placeholder="Card Number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
        />
        {errors.cardNumber && <p className="error">{errors.cardNumber}</p>}

        <input
          type="text"
          placeholder="Card Holder Name"
          value={cardHolderName}
          onChange={(e) => setCardHolderName(e.target.value)}
        />
        {errors.cardHolderName && (
          <p className="error">{errors.cardHolderName}</p>
        )}

        <input
          type="text"
          placeholder="Expiry Date (MM/YY)"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />
        {errors.expiryDate && <p className="error">{errors.expiryDate}</p>}

        <input
          type="text"
          placeholder="CVV"
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
        />
        {errors.cvv && <p className="error">{errors.cvv}</p>}

        <h3>Shipping Information</h3>
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        {errors.address && <p className="error">{errors.address}</p>}

        <input
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />
        {errors.state && <p className="error">{errors.state}</p>}

        <input
          type="text"
          placeholder="Zipcode"
          value={zipcode}
          onChange={(e) => setZipcode(e.target.value)}
        />
        {errors.zipcode && <p className="error">{errors.zipcode}</p>}

        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        {errors.city && <p className="error">{errors.city}</p>}

        <button type="submit" className="register-button">
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
