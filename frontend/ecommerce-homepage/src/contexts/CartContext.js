// src/contexts/CartContext.js
import React, { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const fetchCart = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    const savedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
    return savedCart;
  }
  const response = await axios.get("http://localhost:3001/cart", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const CartProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const {
    data: cartItems = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
    refetchOnWindowFocus: false,
  });

  const addItemToCart = useMutation({
    mutationFn: async (product) => {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          "http://localhost:3001/cart",
          { productId: product.productId, quantity: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const updatedCart = [...cartItems];
        const existingItem = updatedCart.find(
          (item) => item.productId === product.productId
        );
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          updatedCart.push({ ...product, quantity: 1 });
        }
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]); // Refetch cart data after adding item
    },
  });

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItemToCart,
        isLoading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
