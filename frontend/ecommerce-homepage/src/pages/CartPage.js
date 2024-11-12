// src/pages/CartPage.js
import React from "react";
import { useQueries } from "@tanstack/react-query";
import axios from "axios";
import { useCart } from "../contexts/CartContext";

const fetchProductDetails = async (productId) => {
  const response = await axios.get(
    `http://localhost:3001/products/${productId}`
  );
  return response.data;
};

const CartPage = () => {
  const { cartItems, addItemToCart, isLoading, error } = useCart();

  // Use `useQueries` to fetch details for each product in the cart
  const productQueries = useQueries({
    queries: cartItems.map((item) => ({
      queryKey: ["product", item.productId],
      queryFn: () => fetchProductDetails(item.productId),
      enabled: !!item.productId, // Ensure the query only runs if productId exists
    })),
  });

  if (isLoading) return <p>Loading cart...</p>;
  if (error) return <p>Error loading cart.</p>;

  return (
    <div>
      <h1>Your Cart</h1>
      {cartItems.map((item, index) => {
        const productData = productQueries[index]?.data;
        return (
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
              src={productData?.imageUrl || "placeholder.jpg"}
              alt={productData?.name || "Product Image"}
              style={{
                width: "50px",
                height: "50px",
                marginRight: "10px",
                objectFit: "cover",
                borderRadius: "5px",
              }}
            />
            <div>
              <p>Product Name: {productData?.name || "N/A"}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ${productData?.price || "N/A"}</p>
            </div>
          </div>
        );
      })}
      <button onClick={() => addItemToCart.mutate(cartItems[0])}>
        Add More of First Item
      </button>
    </div>
  );
};

export default CartPage;
