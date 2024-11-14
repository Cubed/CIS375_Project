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
  const queryClient = useQueryClient(); // Initialize query client for cache access

  // State for managing the guest user's cart
  const [localCart, setLocalCart] = useState(
    JSON.parse(localStorage.getItem("guestCart")) || []
  );
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0); // State to hold cart total
  const [isFetching, setIsFetching] = useState(false);

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
      const cart = token
        ? await axios
            .get("http://localhost:3001/cart", {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => res.data)
        : localCart;

      const detailedItems = await Promise.all(
        cart.map(async (item) => {
          const productDetail = await fetchProductWithFallback(item.productId);
          return {
            ...item,
            productDetail,
          };
        })
      );

      setCartItems(detailedItems);
      calculateCartTotal(detailedItems); // Calculate total after fetching items
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setIsFetching(false);
    }
  }, [token, localCart]);

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
  const calculateCartTotal = async (items) => {
    if (user && token) {
      // For authenticated users, fetch total from the backend
      try {
        const response = await axios.get("http://localhost:3001/cart/total", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartTotal(response.data.total);
      } catch (error) {
        console.error("Error fetching cart total:", error);
      }
    } else {
      // For guest users, calculate total locally
      const total = items.reduce(
        (sum, item) => sum + (item.productDetail?.price || 0) * item.quantity,
        0
      );
      setCartTotal(total);
    }
  };

  // Update the cart total whenever cart items change
  useEffect(() => {
    calculateCartTotal(cartItems);
  }, [cartItems]);

  // Add a product to the cart
  const addToCart = (product) => {
    if (token) {
      // For authenticated users, add item via server
      axios
        .post(
          "http://localhost:3001/cart",
          { productId: product._id, quantity: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(fetchCartWithDetails)
        .catch((error) => console.error("Error updating server cart:", error));
    } else {
      // For guest users, update localCart directly
      const existingItem = localCart.find(
        (item) => item.productId === product._id
      );
      const updatedCart = existingItem
        ? localCart.map((item) =>
            item.productId === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...localCart, { productId: product._id, quantity: 1 }];

      setLocalCart(updatedCart);
    }
  };

  // Remove a product from the cart
  const removeFromCart = (productId) => {
    if (token) {
      // For authenticated users, remove item via server
      axios
        .delete(`http://localhost:3001/cart/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(fetchCartWithDetails)
        .catch((error) =>
          console.error("Error removing item from server cart:", error)
        );
    } else {
      // For guest users, update localCart directly
      const updatedCart = localCart.filter(
        (item) => item.productId !== productId
      );

      setLocalCart(updatedCart);
    }
  };

  // Update the quantity of a product in the cart
  const updateCartQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
    } else if (token) {
      // For authenticated users, update quantity via server
      axios
        .put(
          `http://localhost:3001/cart/${productId}`,
          { quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(fetchCartWithDetails)
        .catch((error) =>
          console.error("Error updating cart quantity:", error)
        );
    } else {
      // For guest users, update localCart directly
      const updatedCart = localCart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );

      setLocalCart(updatedCart);
    }
  };

  // Clear all items in the cart
  const clearCart = () => {
    if (token) {
      // For authenticated users, clear cart via server
      axios
        .delete("http://localhost:3001/cart/clear", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          setCartItems([]);
          setCartTotal(0);
        })
        .catch((error) => console.error("Error clearing cart:", error));
    } else {
      // For guest users, clear local cart
      setLocalCart([]);
      setCartItems([]);
      setCartTotal(0);
      localStorage.removeItem("guestCart");
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
        loading: isFetching,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
