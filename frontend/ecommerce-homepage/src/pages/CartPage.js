import React, { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { cartItems, cartTotal, loading, updateCartQuantity, removeFromCart } =
    useCart();
  const navigate = useNavigate();

  // Temporary state for handling quantity input before committing
  const [inputValues, setInputValues] = useState(
    cartItems.reduce(
      (acc, item) => ({ ...acc, [item.productId]: item.quantity }),
      {}
    )
  );

  const handleBuyClick = () => {
    navigate("/checkout"); // Redirect to CheckoutPage
  };

  const handleQuantityChange = (productId, newQuantity) => {
    // Update temporary input value state without updating cart quantity
    setInputValues((prev) => ({ ...prev, [productId]: newQuantity }));
  };

  const handleQuantityBlur = (productId) => {
    // Update the cart only when the input is not empty and greater than 0
    if (inputValues[productId] && parseInt(inputValues[productId], 10) > 0) {
      updateCartQuantity(productId, parseInt(inputValues[productId], 10));
    } else {
      // Reset to the cart's current quantity if input is invalid or empty
      const item = cartItems.find((item) => item.productId === productId);
      setInputValues((prev) => ({ ...prev, [productId]: item.quantity }));
    }
  };

  const handleQuantityKeyPress = (e, productId) => {
    if (e.key === "Enter") {
      handleQuantityBlur(productId); // Commit the value on "Enter"
      e.target.blur(); // Remove focus to prevent further edits until refocused
    }
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
            <input
              type="number"
              min="1"
              value={inputValues[item.productId]}
              onChange={(e) =>
                handleQuantityChange(item.productId, e.target.value)
              }
              onBlur={() => handleQuantityBlur(item.productId)}
              onKeyPress={(e) => handleQuantityKeyPress(e, item.productId)}
              style={{ width: "50px", marginRight: "10px" }}
            />
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
