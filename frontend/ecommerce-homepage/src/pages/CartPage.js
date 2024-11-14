// src/pages/CartPage.js
import React from "react";
import { useCart } from "../contexts/CartContext";

const CartPage = () => {
  const { cartItems, addToCart, removeFromCart, updateCartQuantity, loading } =
    useCart();

  if (loading) return <p>Loading cart...</p>;

  if (!cartItems || cartItems.length === 0) {
    return <p>No items in the cart.</p>;
  }

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartQuantity(productId, newQuantity);
    }
  };

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
            <div>
              <label>Quantity:</label>
              <input
                type="number"
                value={item.quantity}
                min="1"
                onChange={(e) =>
                  handleQuantityChange(item.productId, Number(e.target.value))
                }
                style={{ width: "50px", marginLeft: "5px" }}
              />
            </div>
            <p>Price: ${item.productDetail?.price || "N/A"}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartPage;
