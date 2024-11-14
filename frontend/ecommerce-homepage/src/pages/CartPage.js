// src/pages/CartPage.js
import React from "react";
import { useCart } from "../contexts/CartContext";

const CartPage = () => {
  const { cartItems, addToCart, loading } = useCart();

  if (loading) return <p>Loading cart...</p>;

  if (!cartItems || cartItems.length === 0) {
    return <p>No items in the cart.</p>;
  }

  return (
    <div>
      <h1>Your Cart</h1>
      {cartItems.map((item) => (
        <div
          key={item.productId} // Use productId as the unique key
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <img
            src={item.productDetail?.imageUrl || "placeholder.jpg"}
            alt={item.productDetail?.name || "Product Image"}
            style={{
              width: "50px",
              height: "50px",
              marginRight: "10px",
              objectFit: "cover",
              borderRadius: "5px",
            }}
          />
          <div>
            <p>Product Name: {item.productDetail?.name || "N/A"}</p>
            <p>Quantity: {item.quantity}</p>
            <p>Price: ${item.productDetail?.price || "N/A"}</p>
          </div>
        </div>
      ))}
      <button onClick={() => addToCart(cartItems[0]?.productDetail)}>
        Add More of First Item
      </button>
    </div>
  );
};

export default CartPage;
