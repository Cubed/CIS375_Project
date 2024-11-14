// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch the user profile after login or registration
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch("http://localhost:3001/account/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Clear token if fetch fails
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

  // Automatically fetch user profile if a token exists on app load
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Login function with detailed response
  const login = async (email, password) => {
    setLoading(true); // Set loading to true to trigger re-renders if needed
    try {
      const response = await fetch("http://localhost:3001/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);

        // Fetch the profile after setting the token
        await fetchUserProfile();
        return { success: true }; // Return success status
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || "Login failed.",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Password or Email incorrect try again",
      };
    } finally {
      setLoading(false); // Reset loading in case of error
    }
  };

  // Registration function
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);

        // Fetch the profile after setting the token
        await fetchUserProfile();
        return { success: true };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || "Registration failed.",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "An unexpected error occurred." };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
