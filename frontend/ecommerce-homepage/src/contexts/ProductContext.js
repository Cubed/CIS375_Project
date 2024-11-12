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

// Fetch all reviews for a product by product ID along with average rating
const fetchReviews = async (productId) => {
  const response = await axios.get(
    `http://localhost:3001/products/${productId}/reviews`
  );
  return response.data; // Contains { reviews, averageRating }
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
