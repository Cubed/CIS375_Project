// src/pages/HomePage.js
import React from "react";
import ProductCard from "../components/ProductCard";
import "../App.css";
import { useProduct } from "../contexts/ProductContext"; // Import ProductContext

const HomePage = () => {
  const { useProducts } = useProduct(); // Get the hook from ProductContext
  const { data: products = [], isLoading, error } = useProducts(); // Provide a default empty array for products

  if (isLoading) return <p>Loading products...</p>;
  if (error) return <p className="error-message">Error loading products</p>;

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
