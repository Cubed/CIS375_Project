// src/components/CartPage.js
import React from "react";
import "./CartPage.css";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const {
    cartItems,
    cartTotal,
    loading,
    updateCartQuantity,
    removeFromCart,
    purchaseLoading,
    purchaseError,
    purchaseSuccess,
  } = useCart();
  const navigate = useNavigate();

  // Handle navigation to checkout or guest checkout
  const handleBuyClick = () => {
    if (!cartItems || cartItems.length === 0) {
      alert("Your cart is empty. Add some items before checking out.");
      return;
    }

    const token = localStorage.getItem("token");

    if (token) {
      navigate("/checkout");
    } else {
      navigate("/checkout", { state: { isGuest: true } });
    }
  };

  if (loading) return <p className="cart-loading">Loading cart...</p>;

  if (purchaseSuccess && (!cartItems || cartItems.length === 0)) {
    return (
      <div className="cart-success">
        <h1>Purchase Successful!</h1>
        <p>Thank you for your order.</p>
        <button className="continue-shopping-btn" onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return <p className="cart-empty">No items in the cart.</p>;
  }

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>

      {purchaseError && (
        <div className="error-message">
          <p>
            Error:{" "}
            {Array.isArray(purchaseError)
              ? purchaseError.map((err, index) => (
                  <span key={index}>{err.msg} </span>
                ))
              : purchaseError}
          </p>
        </div>
      )}

      {cartItems.map((item) => (
        <div className="cart-item" key={`${item.productId}-${item.size}`}>
          <img
            className="cart-item-image"
            src={item.productDetail?.imageUrl || "placeholder.jpg"}
            alt={item.productDetail?.name || "Product Image"}
          />
          <div className="cart-item-details">
            <h2 className="cart-item-name">
              {item.productDetail?.name || "Unnamed Product"}
            </h2>
            {item.size && <p className="cart-item-size">Size: {item.size}</p>}
            <p className="cart-item-price">
              Price: ${item.productDetail?.price?.toFixed(2) || "N/A"}
            </p>
            <div className="cart-item-quantity">
              <button
                className="quantity-btn"
                onClick={() =>
                  updateCartQuantity(
                    item.productId,
                    item.size,
                    item.quantity - 1
                  )
                }
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span className="quantity-display">
                Quantity: {item.quantity}
              </span>
              <button
                className="quantity-btn"
                onClick={() =>
                  updateCartQuantity(
                    item.productId,
                    item.size,
                    item.quantity + 1
                  )
                }
              >
                +
              </button>
            </div>
            <button
              className="remove-item-btn"
              onClick={() => removeFromCart(item.productId, item.size)}
            >
              Remove Item
            </button>
          </div>
        </div>
      ))}

      <h3 className="cart-total">Total: ${Number(cartTotal).toFixed(2)}</h3>

      <button
        className="checkout-btn"
        onClick={handleBuyClick}
        disabled={purchaseLoading}
      >
        {purchaseLoading ? "Processing..." : "Proceed to Checkout"}
      </button>
    </div>
  );
};

export default CartPage;
