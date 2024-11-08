// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

const Navbar = () => {
  const { cartItemCount } = useCart();

  return (
    <header className="navbar">
      <nav className="nav-container">
        <Link to="/" className="nav-logo">
          E-Commerce
        </Link>
        <div className="nav-cart">
          <Link to="/cart" className="nav-cart-link">
            🛒
            {cartItemCount > 0 && (
              <span className="cart-count">{cartItemCount}</span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
