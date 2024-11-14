// src/pages/HomePage.js
import React, { useState } from "react";
import ProductCard from "../components/ProductCard";
import "../App.css";
import { useProduct } from "../contexts/ProductContext"; // Import ProductContext

const HomePage = () => {
  const { useProducts } = useProduct(); // Get the hook from ProductContext
  const { data: products = [], isLoading, error } = useProducts(); // Provide a default empty array for products

  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  if (isLoading) return <p>Loading products...</p>;
  if (error) return <p className="error-message">Error loading products</p>;

  // Toggle a tag selection
  const toggleTag = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag) ? prevTags.filter((t) => t !== tag) : [...prevTags, tag]
    );
  };

  // Toggle a size selection
  const toggleSize = (size) => {
    setSelectedSizes((prevSizes) =>
      prevSizes.includes(size) ? prevSizes.filter((s) => s !== size) : [...prevSizes, size]
    );
  };

  // Filter products based on selected tags and sizes
  const filteredProducts = products.filter((product) => {
    // Check tags
    const matchesTags =
      selectedTags.length === 0 || selectedTags.every((tag) => product.tags.includes(tag));
    
    // Check sizes
    const matchesSizes =
      selectedSizes.length === 0 || selectedSizes.some((size) => product.sizes.includes(size));

    return matchesTags && matchesSizes;
  });

  return (
    <div className="homepage">
      <aside className="sidebar">
        <h2>Filters</h2>
        <div className="filter-group">
          <label>Tags</label>
          <div className="tag-options">
            {["leather", "jacket", "outerwear", "dress", "accessory"].map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={selectedTags.includes(tag) ? "active" : ""}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label>Sizes</label>
          <div className="size-options">
            {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={selectedSizes.includes(size) ? "active" : ""}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="product-section">
        <div className="product-header">
          <h1>New Arrivals</h1>
          <div className="sort-by">
            <label>Sort by:</label>
            <select>
              <option>Newest First</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
