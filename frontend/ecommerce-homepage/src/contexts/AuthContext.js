// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile after login or registration
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await axios.get("http://localhost:3001/account/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          setUser(response.data);
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    }
    setLoading(false);
  };

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3001/account/login", {
        email,
        password,
      });
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        await fetchUserProfile();
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message || "Login failed.",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "An unexpected error occurred." };
    } finally {
      setLoading(false);
    }
  };

  // New: updateAccount function

  const updateAccount = async (updates) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        "http://localhost:3001/account/update",
        updates,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        await fetchUserProfile(); // Refresh profile after updating
        return { success: true, message: response.data.message };
      } else {
        return {
          success: false,
          message: response.data.message || "Update failed.",
        };
      }
    } catch (error) {
      console.error("Error updating account:", error);

      // Check for the specific error message
      if (error.response?.data?.errors) {
        const creditCardError = error.response.data.errors.find(
          (err) => err.msg === "Invalid credit card number."
        );
        if (creditCardError) {
          return { success: false, message: "Invalid credit card number." };
        }
      }

      return { success: false, message: "An unexpected error occurred." };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, updateAccount, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
