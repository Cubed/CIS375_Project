// src/contexts/ProductContext.js
import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const ProductContext = createContext();

export const useProduct = () => useContext(ProductContext);

// Fetch all products (for HomePage)
const fetchProducts = async () => {
  const response = await axios.get("http://localhost:3001/products");
  return response.data.products;
};

// Fetch individual product by product ID (for ProductDetail)
const fetchProduct = async (productId) => {
  const response = await axios.get(
    `http://localhost:3001/products/${productId}`
  );
  return response.data;
};

// Fetch and cache product reviews by product ID
const fetchReviews = async (productId) => {
  const response = await axios.get(
    `http://localhost:3001/products/${productId}/reviews`
  );
  const reviews = response.data;
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  }
  return 0;
};

export const ProductProvider = ({ children }) => {
  const useProducts = () =>
    useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const useProductDetail = (productId) =>
    useQuery({
      queryKey: ["product", productId],
      queryFn: () => fetchProduct(productId),
      enabled: !!productId,
    });
  const useProductReviews = (productId) =>
    useQuery({
      queryKey: ["reviews", productId],
      queryFn: () => fetchReviews(productId),
      enabled: !!productId,
    });

  return (
    <ProductContext.Provider
      value={{ useProducts, useProductDetail, useProductReviews }}
    >
      {children}
    </ProductContext.Provider>
  );
};
