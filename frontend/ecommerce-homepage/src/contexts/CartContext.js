// src/contexts/CartContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const token = localStorage.getItem("token");
  const [cartItems, setCartItems] = useState([]);

  // Fetch cart items based on token status
  useEffect(() => {
    const fetchCart = async () => {
      if (token) {
        // Fetch cart from server if user is logged in
        try {
          const response = await axios.get("http://localhost:3001/cart", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCartItems(response.data);
        } catch (error) {
          console.error("Error fetching cart from server:", error);
        }
      } else {
        // Load cart from local storage for guests
        const savedCart = localStorage.getItem("cartItems");
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      }
    };
    fetchCart();
  }, [token]);

  // Sync cart to local storage for guests
  useEffect(() => {
    if (!token) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems, token]);

  const addToCart = async (product) => {
    const updatedCart = [...cartItems];
    const existingItem = updatedCart.find(
      (item) => item.productId === product._id
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      updatedCart.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
    }

    setCartItems(updatedCart);

    if (token) {
      // Update server cart if logged in
      try {
        await axios.post(
          "http://localhost:3001/cart",
          { productId: product._id, quantity: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Error updating server cart:", error);
      }
    }
  };

  const removeFromCart = async (productId) => {
    const updatedCart = cartItems.filter(
      (item) => item.productId !== productId
    );
    setCartItems(updatedCart);

    if (token) {
      // Update server cart if logged in
      try {
        await axios.delete(`http://localhost:3001/cart/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error("Error removing item from server cart:", error);
      }
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
