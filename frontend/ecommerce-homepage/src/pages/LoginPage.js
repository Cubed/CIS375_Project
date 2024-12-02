import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css"; // Import the CSS file

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const loginResponse = await login(email, password);

      if (loginResponse.success) {
        // Navigate to the homepage upon successful login
        navigate("/");
      } else {
        // Display error message if login fails
        setErrorMessage(loginResponse.message);
      }
    } catch (error) {
      // Handle unexpected errors
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false); // Re-enable the form after handling response
    }
  };

  return (
    <div className="login-container">
      <div className="login-page">
        {/* Title */}
        <h2 className="form-title">Login</h2>

        {/* Error Message */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="form-group">
            <input
              type="email"
              className="form-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Password Input */}
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
          <div className="register-redirect">
  <p>
    Don't have an account?{" "}
    <a href="/register" className="register-link">
      Register here
    </a>
  </p>
</div>

        </form>
      </div>
    </div>
  );
};

export default LoginPage;