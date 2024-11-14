// src/pages/CartPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCart = async () => {
      if (token) {
        // User is logged in, fetch cart from server
        try {
          const cartResponse = await axios.get("http://localhost:3001/cart", {
            headers: {
              Authorization: `Bearer ${token}`, // Fixed syntax with backticks
            },
          });
          const cartData = cartResponse.data;

          // Fetch product details for each product ID in the cart
          const detailedCartItems = await Promise.all(
            cartData.map(async (item) => {
              try {
                const productResponse = await axios.get(
                  `http://localhost:3001/products/${item.productId}` // Fixed syntax with backticks
                );
                return {
                  ...item,
                  productDetails: productResponse.data,
                };
              } catch (error) {
                console.error(
                  `Error fetching product ${item.productId}:`,
                  error
                ); // Fixed syntax with backticks
                return item; // Return item without additional details in case of an error
              }
            })
          );

          setCartItems(detailedCartItems);
        } catch (error) {
          console.error("Error fetching cart from server:", error);
        }
      } else {
        // User is not logged in, load cart from local storage
        const savedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
        setCartItems(savedCart);
      }
      setLoading(false);
    };

    fetchCart();
  }, [token]);

  useEffect(() => {
  }, [cartItems, token]);

  const addItemToCart = (product) => {
    const updatedCart = [...cartItems];
    const existingItem = updatedCart.find(
      (item) => item.productId === product.productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      updatedCart.push({ ...product, quantity: 1 });
    }
    setCartItems(updatedCart);

    // Sync with server if user is logged in
    if (token) {
      axios
        .post(
          "http://localhost:3001/cart",
          { productId: product.productId, quantity: 1 },
          { headers: { Authorization: `Bearer ${token}` } } // Fixed syntax with backticks
        )
        .catch((error) => console.error("Error updating server cart:", error));
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
      <button onClick={() => addItemToCart(cartItems[0])}>
        Add More of First Item
      </button>
    </div>
  );
};

export default CartPage;
