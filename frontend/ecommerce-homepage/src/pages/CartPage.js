// src/pages/CartPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get("http://localhost:3001/cart", {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MmMyMjMwMDg3OGI3YjJhYzJmYTZkZiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTczMDk1NDk5MywiZXhwIjoxNzMwOTU4NTkzfQ.U36cEaRd--1E0En0tbaOmvmh1f9O20gdS1JNp9mIV_A`, // Replace with actual token
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

  if (!cart || cart.length === 0) {
    return <p>No items in the cart.</p>;
  }

  return (
    <div>
      <h1>Your Cart</h1>
      {cart.map((item) => (
        <div key={item.productId._id}>
          <p>Product Name: {item.productId.name}</p>
          <p>Quantity: {item.quantity}</p>
          <p>Price: ${item.productId.price}</p>
        </div>
      ))}
    </div>
  );
};

export default CartPage;
