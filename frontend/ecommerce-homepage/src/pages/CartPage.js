// src/pages/CartPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const CartPage = () => {
  const [cart, setCart] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get("http://localhost:3001/cart", {
          headers: {
            Authorization: `Bearer your_token_here`, // Replace `your_token_here` with the actual token if required
          },
        });
        setCart(response.data);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    fetchCart();
  }, []);

  if (!cart) return <p>Loading cart...</p>;

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
