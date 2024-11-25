import React, { useState } from "react";
import ProductCard from "../components/ProductCard";
import "../App.css";
import "./AdminPage.css";
import { useProduct } from "../contexts/ProductContext"; // Import ProductContext
import { useAuth } from "../contexts/AuthContext"; // Import AuthContext
import axios from "axios";

const HomePage = () => {
  const { useProducts } = useProduct(); // Get the hook from ProductContext
  const { data: products = [], isLoading, error } = useProducts(); // Provide a default empty array for products
  const { user } = useAuth(); // Get current user
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest"); // Added sortOrder state
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
    tags: [],
    sizes: [],
  }); // State for new product form

  // Handler for adding a new product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token"); // Get the token
      await axios.post("http://localhost:3001/admin/products", newProduct, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Product added successfully");
      window.location.reload(); // Reload the page to fetch updated products
    } catch (error) {
      console.error("Error adding product:", error);
      alert(error.response?.data?.message || "Error adding product");
    }
  };

  if (isLoading) return <p>Loading products...</p>;
  if (error) return <p className="error-message">Error loading products</p>;

  // Toggle a tag selection
  const toggleTag = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  // Toggle a size selection
  const toggleSize = (size) => {
    setSelectedSizes((prevSizes) =>
      prevSizes.includes(size)
        ? prevSizes.filter((s) => s !== size)
        : [...prevSizes, size]
    );
  };

  // Filter products based on selected tags and sizes
  const filteredProducts = products.filter((product) => {
    // Check tags
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => product.tags.includes(tag));

    // Check sizes
    const matchesSizes =
      selectedSizes.length === 0 ||
      selectedSizes.some((size) => product.sizes.includes(size));

    return matchesTags && matchesSizes;
  });

  // Sort products based on sortOrder
  const sortedProducts = [...filteredProducts].sort((b, a) => {
    if (sortOrder === "newest") {
      return (
        new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime()
      ); // Newest first
    } else if (sortOrder === "hightoLow") {
      return a.price - b.price; // Price: High to Low
    } else if (sortOrder === "lowtoHigh") {
      return b.price - a.price; // Price: Low to High
    }
    return 0;
  });

  return (
    <div className="homepage">
      <aside className="sidebar">
        <h2>Filters</h2>
        <div className="filter-group">
          <label>Tags</label>
          <div className="tag-options">
            {["leather", "jacket", "outerwear", "dress", "accessory"].map(
              (tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={selectedTags.includes(tag) ? "active" : ""}
                >
                  {tag}
                </button>
              )
            )}
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
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="hightoLow">Price: High to Low</option>
              <option value="lowtoHigh">Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Admin Add Product Form */}
        {user?.isAdmin && (
          <form className="add-product-form" onSubmit={handleAddProduct}>
            <h2>Add Product</h2>
            <div className="form-group">
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                required
                className="form-textarea"
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Image URL"
                value={newProduct.imageUrl}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, imageUrl: e.target.value })
                }
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                value={newProduct.tags}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    tags: e.target.value.split(",").map((tag) => tag.trim()),
                  })
                }
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Sizes (comma-separated)"
                value={newProduct.sizes}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    sizes: e.target.value.split(",").map((size) => size.trim()),
                  })
                }
                required
                className="form-input"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Add Product
              </button>
            </div>
          </form>
        )}

        <div className="product-grid">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              isAdmin={user?.isAdmin}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
