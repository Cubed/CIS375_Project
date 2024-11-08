// src/pages/ProductDetail.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/products/${productId}`
        );
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const addToCart = async () => {
    try {
      await axios.post(
        "http://localhost:3001/cart",
        { productId: product._id, quantity: 1 },
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MmMyMjMwMDg3OGI3YjJhYzJmYTZkZiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTczMTAzMTM3NywiZXhwIjoxNzMxMDM0OTc3fQ.h1p4VxCzOBJRCNu7Ozm5ztW1xnst70c3qJ7yxMStdEU`, // Replace with actual token
          },
        }
      );
      alert("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
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
