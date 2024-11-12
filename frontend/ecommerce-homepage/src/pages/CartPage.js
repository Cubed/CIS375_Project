// src/pages/CartPage.js
import React from "react";
import { useCart } from "../contexts/CartContext";

const CartPage = () => {
  const { cartItems, addToCart, removeFromCart } = useCart();

  if (!cartItems || cartItems.length === 0) {
    return <p>No items in the cart.</p>;
  }

  return (
    <div>
      <h1>Your Cart</h1>
      {cartItems.map((item) => (
        <div
          key={item.productId}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          {/* Display the product image */}
          <img
            src={item.imageUrl || "placeholder.jpg"} // Use a placeholder if imageUrl is not available
            alt={item.name || "Product Image"}
            style={{
              width: "50px",
              height: "50px",
              marginRight: "10px",
              objectFit: "cover",
              borderRadius: "5px",
            }}
          />
          <div>
            <p>Product Name: {item.name || "N/A"}</p>
            <p>Quantity: {item.quantity}</p>
            <p>Price: ${item.price || "N/A"}</p>
          </div>
          <button onClick={() => addToCart(item)}>Add More</button>
          <button onClick={() => removeFromCart(item.productId)}>Remove</button>
        </div>
      ))}
    </div>
  );
};

export default CartPage;
