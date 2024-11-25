// src/components/CartPage.js
import React from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  // Destructure the necessary properties from the useCart hook
  const {
    cartItems,
    cartTotal,
    loading,
    updateCartQuantity,
    removeFromCart,
    purchaseCart,
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
      // Navigate to the checkout page for authenticated users
      navigate("/checkout");
    } else {
      // Navigate to the guest checkout page
      navigate("/checkout", { state: { isGuest: true } });
    }
  };

  if (loading) return <p>Loading cart...</p>;

  // If purchase was successful and cart is empty, display the success message
  if (purchaseSuccess && (!cartItems || cartItems.length === 0)) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>Purchase Successful!</h1>
        <p>Thank you for your order.</p>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            marginTop: "20px",
          }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  // Check if the cart or products array is empty
  if (!cartItems || cartItems.length === 0) {
    return <p>No items in the cart.</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Your Cart</h1>

      {/* Display purchase error message */}
      {purchaseError && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            marginBottom: "20px",
            borderRadius: "5px",
          }}
        >
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
        <div
          key={`${item.productId}-${item.size}`}
          style={{
            marginBottom: "20px",
            border: "1px solid #ccc",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            borderRadius: "5px",
          }}
        >
          {/* Display product image */}
          <img
            src={item.productDetail?.imageUrl || "placeholder.jpg"}
            alt={item.productDetail?.name || "Product Image"}
            style={{
              width: "100px",
              height: "100px",
              objectFit: "cover",
              marginRight: "20px",
              borderRadius: "5px",
            }}
          />

          {/* Product Information */}
          <div style={{ flex: 1 }}>
            {/* Display product name */}
            <h2>{item.productDetail?.name || "Unnamed Product"}</h2>

            {/* Display product size */}
            {item.size && <p>Size: {item.size}</p>}

            {/* Display product price */}
            <p>Price: ${item.productDetail?.price?.toFixed(2) || "N/A"}</p>

            {/* Quantity controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "10px",
              }}
            >
              <button
                onClick={() =>
                  updateCartQuantity(
                    item.productId,
                    item.size,
                    item.quantity - 1
                  )
                }
                disabled={item.quantity <= 1}
                style={{
                  padding: "5px 10px",
                  cursor: item.quantity <= 1 ? "not-allowed" : "pointer",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  backgroundColor: "#f0f0f0",
                }}
              >
                -
              </button>
              <span style={{ margin: "0 15px" }}>
                Quantity: {item.quantity}
              </span>
              <button
                onClick={() =>
                  updateCartQuantity(
                    item.productId,
                    item.size,
                    item.quantity + 1
                  )
                }
                style={{
                  padding: "5px 10px",
                  cursor: "pointer",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  backgroundColor: "#f0f0f0",
                }}
              >
                +
              </button>
            </div>

            {/* Remove item button */}
            <button
              onClick={() => removeFromCart(item.productId, item.size)}
              style={{
                marginTop: "10px",
                color: "white",
                backgroundColor: "red",
                border: "none",
                padding: "5px 10px",
                cursor: "pointer",
                borderRadius: "3px",
              }}
            >
              Remove Item
            </button>
          </div>
        </div>
      ))}

      {/* Display total price */}
      <h3>Total: ${Number(cartTotal).toFixed(2)}</h3>

      {/* Proceed to checkout button */}
      <button
        onClick={handleBuyClick}
        disabled={purchaseLoading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: purchaseLoading ? "not-allowed" : "pointer",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
          marginTop: "20px",
        }}
      >
        {purchaseLoading ? "Processing..." : "Proceed to Checkout"}
      </button>
    </div>
  );
};

export default CartPage;
