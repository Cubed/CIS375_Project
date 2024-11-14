import React, { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import Modal from "../components/Modal";

const CartPage = () => {
  const {
    cartItems,
    cartTotal,
    loading,
    clearCart,
    updateCartQuantity,
    removeFromCart,
  } = useCart();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const generateDeliveryDate = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(
      deliveryDate.getDate() + Math.floor(Math.random() * 3) + 3
    );
    return deliveryDate.toDateString();
  };

  const handleBuyClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmPurchase = () => {
    if (
      !user &&
      (!address ||
        !zipCode ||
        !cardNumber ||
        !cardHolderName ||
        !expiryDate ||
        !cvv)
    ) {
      alert("Please enter all required information.");
      return;
    }

    // Simulate successful purchase
    alert("Purchase confirmed! Your order will be delivered soon.");

    // Clear the cart after successful purchase
    clearCart();
    setIsModalOpen(false);
  };

  const handleIncreaseQuantity = (productId, currentQuantity) => {
    updateCartQuantity(productId, currentQuantity + 1);
  };

  const handleDecreaseQuantity = (productId, currentQuantity) => {
    if (currentQuantity > 1) {
      updateCartQuantity(productId, currentQuantity - 1);
    } else {
      removeFromCart(productId);
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
            <button
              onClick={() =>
                handleDecreaseQuantity(item.productId, item.quantity)
              }
            >
              -
            </button>
            <span style={{ margin: "0 10px" }}>Quantity: {item.quantity}</span>
            <button
              onClick={() =>
                handleIncreaseQuantity(item.productId, item.quantity)
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
      <p>Total: ${cartTotal ? cartTotal.toFixed(2) : "0.00"}</p>
      <button onClick={handleBuyClick}>Buy</button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Order Review</h2>
        <p>
          <strong>Estimated Delivery Date:</strong> {generateDeliveryDate()}
        </p>
        <p>
          <strong>Total Price:</strong> $
          {cartTotal ? cartTotal.toFixed(2) : "0.00"}
        </p>

        {user ? (
          <>
            <p>
              <strong>Shipping Address:</strong>{" "}
              {user.address || "1234 Example St"}
            </p>
            <p>
              <strong>Zip Code:</strong> {user.zipCode || "00000"}
            </p>
          </>
        ) : (
          <div>
            <h3>Enter Shipping Information</h3>
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Zip Code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
            />

            <h3>Enter Payment Information</h3>
            <input
              type="text"
              placeholder="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Card Holder Name"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Expiry Date (MM/YY)"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              required
            />
          </div>
        )}

        <button onClick={handleConfirmPurchase}>Confirm Purchase</button>
      </Modal>
    </div>
  );
};

export default CartPage;
