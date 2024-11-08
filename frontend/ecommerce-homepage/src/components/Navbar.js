// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { cartItemCount } = useCart();
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <nav className="nav-container">
        <Link to="/" className="nav-logo">
          E-Commerce
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <button onClick={logout} className="nav-button">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-button">Login</Link>
              <Link to="/register" className="nav-button">Register</Link>
            </>
          )}
        </div>
        <div className="nav-cart">
          <Link to="/cart" className="nav-cart-link">
            🛒
            {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
