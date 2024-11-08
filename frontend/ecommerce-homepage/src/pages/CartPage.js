// src/pages/CartPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        // Step 1: Fetch cart data from /cart endpoint
        const cartResponse = await axios.get("http://localhost:3001/cart", {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MmMyMjMwMDg3OGI3YjJhYzJmYTZkZiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTczMTAzNzA3NSwiZXhwIjoxNzMxMDQwNjc1fQ.8GOqtaCTWWMeAFY5p72EiAy0DQQCPOd4Fer7P6twerY`, // Replace with actual token
          },
        });

        const cartData = cartResponse.data;

        // Step 2: Fetch product details for each product ID in the cart
        const detailedCartItems = await Promise.all(
          cartData.map(async (item) => {
            try {
              const productResponse = await axios.get(
                `http://localhost:3001/products/${item.productId}`
              );

              return {
                ...item,
                productDetails: productResponse.data,
              };
            } catch (error) {
              console.error(`Error fetching product ${item.productId}:`, error);
              return item; // Return item without additional details in case of an error
            }
          })
        );

        // Step 3: Update the cartItems state with detailed product information
        setCartItems(detailedCartItems);
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  if (loading) return <p>Loading cart...</p>;

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
            src={item.productDetails?.imageUrl || "placeholder.jpg"} // Use a placeholder if imageUrl is not available
            alt={item.productDetails?.name || "Product Image"}
            style={{
              width: "50px",
              height: "50px",
              marginRight: "10px",
              objectFit: "cover",
              borderRadius: "5px",
            }}
          />
          <div>
            <p>Product Name: {item.productDetails?.name || "N/A"}</p>
            <p>Quantity: {item.quantity}</p>
            <p>Price: ${item.productDetails?.price || "N/A"}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartPage;
