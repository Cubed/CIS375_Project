import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import "../App.css";

// Function to fetch products
const fetchProducts = async () => {
  const response = await axios.get("http://localhost:3001/products");
  return response.data.products;
};

const HomePage = () => {
  // Use React Query to fetch data with caching
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  if (isLoading) return <p>Loading products...</p>;
  if (error)
    return (
      <p className="error-message">
        Failed to load products. Please try again later.
      </p>
    );

  return (
    <div className="homepage">
      <h1>Products</h1>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
