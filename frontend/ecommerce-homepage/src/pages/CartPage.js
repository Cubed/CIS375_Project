// src/components/CartPage.js
import React from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { cartItems, cartTotal, loading, updateCartQuantity, removeFromCart } =
    useCart();
  const navigate = useNavigate();

  const handleBuyClick = () => {
    navigate("/checkout"); // Redirect to CheckoutPage
  };

  if (loading) return <p>Loading cart...</p>;

  if (!cartItems || cartItems.length === 0) {
    return <p>No items in the cart.</p>;
  }

  return (
    <div>
      <h1>Your Cart</h1>
      {cartItems.map((item) => (
        <div key={item.productId} style={{ marginBottom: "20px" }}>
          <img
            src={item.productDetail?.imageUrl || "placeholder.jpg"}
            alt={item.productDetail?.name || "Product Image"}
            style={{ width: "50px", height: "50px" }}
          />
          <p>{item.productDetail?.name || "N/A"}</p>
          <p>Price: ${item.productDetail?.price || "N/A"}</p>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={() =>
                updateCartQuantity(item.productId, item.quantity - 1)
              }
            >
              -
            </button>
            <span style={{ margin: "0 10px" }}>Quantity: {item.quantity}</span>
            <button
              onClick={() =>
                updateCartQuantity(item.productId, item.quantity + 1)
              }
            >
              +
            </button>
          </div>
          <button
            onClick={() => removeFromCart(item.productId)}
            style={{ marginTop: "10px", color: "red" }}
          >
            Remove Item
          </button>
        </div>
      ))}
      <p>Total: ${Number(cartTotal).toFixed(2)}</p>
      <button onClick={handleBuyClick}>Proceed to Checkout</button>
    </div>
  );
};

export default CartPage;
