// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile if token exists in localStorage
  useEffect(() => {
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
            // Clear token if profile fetch fails
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  // Login function with profile re-fetch
  const login = async (email, password) => {
    setLoading(true); // Set loading to true to trigger re-renders if needed
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
    } else {
      console.error("Login failed");
      setLoading(false); // Reset loading in case of error
    }
  };

  // Function to fetch the user profile after login
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

  const register = async (userData) => {
    setLoading(true);
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
    } else {
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
