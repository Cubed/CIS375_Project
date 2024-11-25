import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import "../pages/AdminPage.css";
import { useProduct } from "../contexts/ProductContext";
import axios from "axios";

const ProductCard = ({ product, isAdmin }) => {
  const { useProductReviews } = useProduct();
  const { data: reviewsData, error } = useProductReviews(product._id);

  const averageRating = reviewsData?.averageRating || 0;

  const [isEditing, setIsEditing] = useState(false); // Toggle edit mode
  const [editedProduct, setEditedProduct] = useState(product); // Store edited product details

  // Function to render stars based on rating
  const renderStars = (rating) => {
    const stars = Array(5).fill("☆"); // Initialize an array with five empty stars

    // Fill the array with full stars based on the rating
    for (let i = 0; i < Math.floor(rating); i++) {
      stars[i] = "★";
    }

    return stars.map((star, index) => (
      <span key={index} className={`star ${star === "★" ? "full" : "empty"}`}>
        {star}
      </span>
    ));
  };

  // Handle product deletion
  const handleDeleteProduct = async () => {
    try {
      const token = localStorage.getItem("token"); // Get the token
      await axios.delete(
        `http://localhost:3001/admin/products/${product._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Product deleted successfully");
      window.location.reload(); // Reload the page to fetch updated products
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(error.response?.data?.message || "Error deleting product");
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token"); // Get the token

      // Prepare the edited product data
      const { name, price, description, imageUrl, tags, sizes } = editedProduct;
      const updatedProduct = {
        name,
        price,
        description,
        imageUrl,
        tags: Array.isArray(tags)
          ? tags
          : tags.split(",").map((tag) => tag.trim()),
        sizes: Array.isArray(sizes)
          ? sizes
          : sizes.split(",").map((size) => size.trim()),
      };

      // Make the PUT request
      await axios.put(
        `http://localhost:3001/admin/products/${product._id}`,
        updatedProduct,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Product updated successfully");
      setIsEditing(false); // Exit edit mode
      window.location.reload(); // Reload the page to fetch updated products
    } catch (error) {
      console.error("Error updating product:", error);

      // Display error message
      alert(error.response?.data?.message || "Error updating product");
    }
  };

  return (
    <div className="product-card">
      {isEditing ? (
        <form className="edit-product-form" onSubmit={handleEditProduct}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Product Name"
              value={editedProduct.name}
              onChange={(e) =>
                setEditedProduct({ ...editedProduct, name: e.target.value })
              }
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              placeholder="Price"
              value={editedProduct.price}
              onChange={(e) =>
                setEditedProduct({ ...editedProduct, price: e.target.value })
              }
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="Description"
              value={editedProduct.description}
              onChange={(e) =>
                setEditedProduct({
                  ...editedProduct,
                  description: e.target.value,
                })
              }
              required
              className="form-textarea"
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Image URL"
              value={editedProduct.imageUrl}
              onChange={(e) =>
                setEditedProduct({ ...editedProduct, imageUrl: e.target.value })
              }
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              value={editedProduct.tags.join(", ")}
              onChange={(e) =>
                setEditedProduct({
                  ...editedProduct,
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
              value={editedProduct.sizes.join(", ")}
              onChange={(e) =>
                setEditedProduct({
                  ...editedProduct,
                  sizes: e.target.value.split(",").map((size) => size.trim()),
                })
              }
              required
              className="form-input"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <Link to={`/product/${product._id}`}>
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-image"
            />
            <h3 className="product-name">{product.name}</h3>
          </Link>
          <p className="product-price">${product.price.toFixed(2)}</p>
          <div className="product-rating">
            {error ? (
              <span>Error loading rating</span>
            ) : (
              renderStars(averageRating)
            )}
          </div>
          <div className="product-tags">
            {product.tags && product.tags.length > 0 ? (
              product.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))
            ) : (
              <span className="no-tags">No Tags</span>
            )}
          </div>
          {isAdmin && (
            <div className="admin-actions">
              <button
                className="edit-button btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
              <button
                className="delete-button btn-danger"
                onClick={handleDeleteProduct}
              >
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductCard;
