// src/contexts/ProductContext.js
import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query"; // Removed useQueryClient
import axios from "axios";

const ProductContext = createContext();

export const useProduct = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  // Fetch all products (for HomePage)
  const fetchProducts = async () => {
    const response = await axios.get("http://localhost:3001/products");
    return response.data.products;
  };

  // Fetch and cache product reviews by product ID
  const fetchReviews = async (productId) => {
    const response = await axios.get(
      `http://localhost:3001/products/${productId}/reviews`
    );
    const reviews = response.data;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      return totalRating / reviews.length;
    }
    return 0;
  };

  // Use React Query to manage and cache products and reviews
  const useProducts = () =>
    useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const useProductReviews = (productId) =>
    useQuery({
      queryKey: ["reviews", productId],
      queryFn: () => fetchReviews(productId),
      enabled: !!productId, // Only run query if productId is available
    });

  return (
    <ProductContext.Provider value={{ useProducts, useProductReviews }}>
      {children}
    </ProductContext.Provider>
  );
};
