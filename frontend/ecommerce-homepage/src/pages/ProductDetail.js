// src/pages/ProductDetail.js
import React from "react";
import { useParams } from "react-router-dom";
import { useProduct } from "../contexts/ProductContext";
import axios from "axios";

const ProductDetail = () => {
  const { productId } = useParams();
  const { useProductDetail } = useProduct(); // Get the hook from ProductContext
  const { data: product, isLoading, error } = useProductDetail(productId);
  const token = localStorage.getItem("token");

  const addToCart = async () => {
    if (token) {
      // User is logged in, add item to the cart on the server
      try {
        await axios.post(
          "http://localhost:3001/cart",
          { productId: product._id, quantity: 1 },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert("Added to cart!");
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    } else {
      // User is not logged in, add item to the cart in local storage
      const savedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
      const existingItem = savedCart.find(
        (item) => item.productId === product._id
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        savedCart.push({
          productId: product._id,
          quantity: 1,
          productDetails: product,
        });
      }

      localStorage.setItem("cartItems", JSON.stringify(savedCart));
      alert("Added to cart!");
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading product details.</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div className="product-detail">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="product-detail-image"
      />
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <button onClick={addToCart}>Add to Cart</button>
    </div>
  );
};

export default ProductDetail;
