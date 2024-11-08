import React, { useEffect, useState } from "react";
import axios from "axios";

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get("http://localhost:3001/cart", {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MmMyMjMwMDg3OGI3YjJhYzJmYTZkZiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTczMTAzMTM3NywiZXhwIjoxNzMxMDM0OTc3fQ.h1p4VxCzOBJRCNu7Ozm5ztW1xnst70c3qJ7yxMStdEU`,
          },
        });
        setCart(response.data);
      } catch (error) {
        console.error(
          "Error fetching cart:",
          error.response ? error.response.data : error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  if (loading) return <p>Loading cart...</p>;

  if (!cart || cart.length === 0) {
    return <p>No items in the cart.</p>;
  }

  return (
    <div>
      <h1>Your Cart</h1>
      {cart.map((item, index) => (
        <div key={item.productId._id || index}>
          <p>Product Name: {item.productId.name}</p>
          <p>Quantity: {item.quantity}</p>
          <p>Price: ${item.productId.price}</p>
        </div>
      ))}
    </div>
  );
};

export default CartPage;
