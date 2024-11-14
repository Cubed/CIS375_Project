// src/contexts/CartContext.js
import React, { createContext, useContext } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const fetchCartWithDetails = async (token) => {
  const response = await axios.get("http://localhost:3001/cart", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const cartItems = response.data;

  // Fetch product details for each item in parallel
  const detailedItems = await Promise.all(
    cartItems.map(async (item) => {
      const productResponse = await axios.get(
        `http://localhost:3001/products/${item.productId}`
      );
      return {
        ...item,
        productDetail: productResponse.data,
      };
    })
  );

  return detailedItems;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const token = user ? localStorage.getItem("token") : null;

  const {
    data: cartItems = [],
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["cart", token],
    queryFn: () => fetchCartWithDetails(token),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const addToCart = async (product) => {
    if (token) {
      try {
        await axios.post(
          "http://localhost:3001/cart",
          { productId: product._id, quantity: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        refetch(); // Refetch cart items after adding
      } catch (error) {
        console.error("Error updating server cart:", error);
      }
    }
  };

  const removeFromCart = async (productId) => {
    if (token) {
      try {
        await axios.delete(`http://localhost:3001/cart/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        refetch(); // Refetch cart items after removing
      } catch (error) {
        console.error("Error removing item from server cart:", error);
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartItemCount,
        addToCart,
        removeFromCart,
        loading: isFetching,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
