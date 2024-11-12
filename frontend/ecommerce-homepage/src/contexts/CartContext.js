// src/contexts/CartContext.js
import React, { createContext, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useProduct } from "./ProductContext"; // Import useProduct from ProductContext

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const token = localStorage.getItem("token");
  const { useProducts } = useProduct(); // Access useProducts from ProductContext
  const { data: products = [] } = useProducts(); // Fetch all products

  // Function to fetch cart items
  const fetchCart = async () => {
    if (token) {
      // Fetch cart from server if user is logged in
      const response = await axios.get("http://localhost:3001/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } else {
      // Load cart from local storage for guests
      const savedCart = localStorage.getItem("cartItems");
      return savedCart ? JSON.parse(savedCart) : [];
    }
  };

  // Use React Query to fetch cart items with Object form
  const { data: cartItems = [], refetch: refetchCart } = useQuery({
    queryKey: ["cartItems", token],
    queryFn: fetchCart,
    onSuccess: (data) => {
      // Sync to local storage if user is not logged in
      if (!token) {
        localStorage.setItem("cartItems", JSON.stringify(data));
      }
    },
  });

  // Mutation for adding items to the cart
  const addToCartMutation = useMutation({
    mutationFn: async (product) => {
      if (token) {
        // Send request to server if logged in
        await axios.post(
          "http://localhost:3001/cart",
          { productId: product._id, quantity: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Handle local storage for guests
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
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      }
    },
    onSuccess: () => {
      // Refetch cart items after adding to cart
      refetchCart();
    },
  });

  // Mutation for removing items from the cart
  const removeFromCartMutation = useMutation({
    mutationFn: async (productId) => {
      if (token) {
        // Send request to server if logged in
        await axios.delete(`http://localhost:3001/cart/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Handle local storage for guests
        const updatedCart = cartItems.filter(
          (item) => item.productId !== productId
        );
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      }
    },
    onSuccess: () => {
      // Refetch cart items after removing from cart
      refetchCart();
    },
  });

  const addToCart = (product) => addToCartMutation.mutate(product);
  const removeFromCart = (productId) =>
    removeFromCartMutation.mutate(productId);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, products }}
    >
      {children}
    </CartContext.Provider>
  );
};
