// src/components/Header.js
import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

const Header = () => {
  const { cartItemCount } = useCart();

  return (
    <header className="header">
      <Link to="/" className="logo">
        E-Commerce
      </Link>
      <div className="cart-icon">
        <Link to="/cart">
          🛒
          {cartItemCount > 0 && (
            <span className="cart-count">{cartItemCount}</span>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Header;
