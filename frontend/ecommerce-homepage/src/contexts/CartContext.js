// src/contexts/CartContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { useQueryClient } from "@tanstack/react-query";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const token = user ? localStorage.getItem("token") : null;
  const queryClient = useQueryClient();

  // State for managing the guest user's cart
  const [localCart, setLocalCart] = useState(
    JSON.parse(localStorage.getItem("guestCart")) || []
  );
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Fetch product details from cache or make an API call if not cached
  const fetchProductDetailsFromCache = (productId) => {
    return queryClient.getQueryData(["product", productId]);
  };

  const fetchProductWithFallback = async (productId) => {
    const cachedProduct = fetchProductDetailsFromCache(productId);
    if (cachedProduct) {
      return cachedProduct;
    }

    // Fetch from API if not in cache and then store it in cache
    const response = await axios.get(
      `http://localhost:3001/products/${productId}`
    );
    const product = response.data;
    queryClient.setQueryData(["product", productId], product);
    return product;
  };

  // Fetch detailed cart items for both authenticated and guest users
  const fetchCartWithDetails = useCallback(async () => {
    setIsFetching(true);
    try {
      let products = [];

      if (token) {
        // Fetch cart array for authenticated users
        const cartResponse = await axios.get("http://localhost:3001/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cart = cartResponse.data;

        // Since the backend returns an array directly, use it as products
        if (Array.isArray(cart)) {
          products = cart;
        }
      } else {
        // Use localCart for guest users
        products = localCart;
      }

      // Fetch detailed product information
      const detailedItems = await Promise.all(
        products.map(async (item) => {
          const productDetail = await fetchProductWithFallback(item.productId);
          return {
            ...item,
            productDetail,
          };
        })
      );

      setCartItems(detailedItems);
      console.log("Updated Cart Items:", detailedItems); // Debugging
      calculateCartTotal(detailedItems);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setIsFetching(false);
    }
  }, [token, localCart, queryClient]);

  // Fetch cart items on load and whenever token or localCart changes
  useEffect(() => {
    fetchCartWithDetails();
  }, [fetchCartWithDetails]);

  // Save localCart to localStorage whenever it changes for guest users
  useEffect(() => {
    if (!token) {
      localStorage.setItem("guestCart", JSON.stringify(localCart));
    }
  }, [localCart, token]);

  // Calculate total item count in the cart
  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Calculate the cart total based on cart items
  const calculateCartTotal = useCallback(
    async (items) => {
      if (user && token) {
        // For authenticated users, fetch total from the backend
        try {
          const response = await axios.get("http://localhost:3001/cart/total", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCartTotal(response.data.total || 0);
        } catch (error) {
          console.error("Error fetching cart total:", error);
          setCartTotal(0);
        }
      } else {
        // For guest users, calculate total locally
        const total = items.reduce((sum, item) => {
          const price = item.productDetail?.price || 0;
          const quantity = item.quantity || 0;
          return sum + price * quantity;
        }, 0);
        setCartTotal(total);
      }
    },
    [user, token]
  );

  // Update the cart total whenever cart items change
  useEffect(() => {
    calculateCartTotal(cartItems);
  }, [cartItems, calculateCartTotal]);

  // Add a product to the cart
  const addToCart = async ({ productId, size, quantity }) => {
    if (token) {
      // For authenticated users, add item via server
      try {
        const payload = { productId, size, quantity };
        await axios.post("http://localhost:3001/cart", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await fetchCartWithDetails();
      } catch (error) {
        console.error("Error updating server cart:", error);
        throw error; // Propagate error to the caller
      }
    } else {
      // For guest users, update localCart directly
      const existingItem = localCart.find(
        (item) => item.productId === productId && item.size === size
      );
      let updatedCart;
      if (existingItem) {
        updatedCart = localCart.map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updatedCart = [...localCart, { productId, size, quantity }];
      }

      setLocalCart(updatedCart);

      // Update cartItems for guest users
      const productDetail = await fetchProductWithFallback(productId);
      const existingCartItem = cartItems.find(
        (item) => item.productId === productId && item.size === size
      );
      if (existingCartItem) {
        setCartItems(
          cartItems.map((item) =>
            item.productId === productId && item.size === size
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        );
      } else {
        setCartItems([
          ...cartItems,
          { productId, size, quantity, productDetail },
        ]);
      }
    }
  };

  // Remove a product from the cart
  const removeFromCart = async (productId, size) => {
    if (token) {
      // For authenticated users, remove item via server
      try {
        await axios.delete(`http://localhost:3001/cart/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { size }, // Backend needs size to remove specific item
        });
        await fetchCartWithDetails();
      } catch (error) {
        console.error("Error removing item from server cart:", error);
      }
    } else {
      // For guest users, update localCart directly
      const updatedCart = localCart.filter(
        (item) => !(item.productId === productId && item.size === size)
      );

      setLocalCart(updatedCart);
      // Update cartItems for guest users
      setCartItems(
        cartItems.filter(
          (item) => !(item.productId === productId && item.size === size)
        )
      );
    }
  };

  // Update the quantity of a product in the cart
  const updateCartQuantity = async (productId, size, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId, size);
      return;
    }

    if (token) {
      // For authenticated users, update quantity via server
      try {
        const payload = { size, quantity };
        await axios.put(`http://localhost:3001/cart/${productId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await fetchCartWithDetails();
      } catch (error) {
        console.error("Error updating cart quantity:", error);
      }
    } else {
      // For guest users, update localCart directly
      const updatedCart = localCart.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity }
          : item
      );

      setLocalCart(updatedCart);
      // Update cartItems for guest users
      setCartItems(
        cartItems.map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  // Clear all items in the cart
  const clearCart = async () => {
    if (token) {
      // For authenticated users, clear cart via server
      try {
        await axios.delete("http://localhost:3001/cart_all/delete", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems([]);
        setCartTotal(0);
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    } else {
      // For guest users, clear local cart
      setLocalCart([]);
      setCartItems([]);
      setCartTotal(0);
      localStorage.removeItem("guestCart");
    }
  };

  /**
   * Purchase all items in the cart.
   * For each cart item, send a purchase request to the backend.
   * After successful purchases, clear the cart.
   */
  const purchaseCart = async () => {
    if (!token) {
      throw new Error("User is not authenticated. Please log in to proceed.");
    }

    setPurchaseLoading(true);
    setPurchaseError(null);
    setPurchaseSuccess(false);

    try {
      // Fetch the cart data from the backend
      const cartResponse = await axios.get("http://localhost:3001/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cartData = cartResponse.data;

      // Validate that the response is an array and has items
      if (!cartData || !Array.isArray(cartData) || cartData.length === 0) {
        throw new Error("Cart is empty or missing required data.");
      }

      // Create an array of purchase promises for each product in the cart
      const purchasePromises = cartData.map((item) => {
        console.log(item);
        if (!item.size || !item.quantity) {
          throw new Error(
            `Invalid cart item: Product ID ${item.productId} is missing size or quantity.`
          );
        }

        return axios.post(
          `http://localhost:3001/purchase/${item.productId}`,
          {
            size: item.size, // Corrected to fetch size from the current item
            quantity: item.quantity,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      });

      // Execute all purchase requests concurrently
      await Promise.all(purchasePromises);

      // Clear the cart after successful purchases
      await clearCart();

      setPurchaseSuccess(true);
    } catch (error) {
      console.error("Error purchasing cart items:", error);
      setPurchaseError(
        error.response?.data?.errors ||
          error.response?.data?.message ||
          error.message ||
          "An error occurred during the purchase."
      );
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartItemCount,
        cartTotal, // Expose cart total in context
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart, // Expose clear cart function
        purchaseCart, // Expose purchaseCart function
        loading: isFetching,
        purchaseLoading,
        purchaseError,
        purchaseSuccess,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
