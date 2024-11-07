// src/pages/CartPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get("http://localhost:3001/cart/total", {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MmMyMjMwMDg3OGI3YjJhYzJmYTZkZiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTczMDk1NDk5MywiZXhwIjoxNzMwOTU4NTkzfQ.U36cEaRd--1E0En0tbaOmvmh1f9O20gdS1JNp9mIV_A`, // Replace `your_token_here` with the actual token if required
          },
        });
        setCart(response.data);
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  if (loading) return <p>Loading cart...</p>;

  if (!cart || !cart.products) {
    return <p>No items in the cart.</p>;
  }

  return (
    <div>
      <h1>Your Cart</h1>
      {cart.products.map((item) => (
        <div key={item.productId}>
          <p>Product ID: {item.productId}</p>
          <p>Quantity: {item.quantity}</p>
        </div>
      ))}
    </div>
  );
};

export default CartPage;
