// src/components/Navbar.js
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { ReactComponent as UserIcon } from "../assets/user.svg"; // Ensure you have these SVGs
import { ReactComponent as CartIcon } from "../assets/cart.svg";

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const { cartItemCount } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  return (
    <header className="navbar">
      <nav className="nav-container">
        <Link to="/" className="nav-logo">
          E-Commerce
        </Link>
        <div className="nav-links">
          {/* User Account Section */}
          <div className="nav-item" ref={dropdownRef}>
            <button
              className="icon-button"
              onClick={toggleDropdown}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <UserIcon className="nav-icon" />
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                {loading ? (
                  <span className="dropdown-item">Loading...</span>
                ) : user ? (
                  <>
                    <Link to="/account" className="dropdown-item">
                      Update Account
                    </Link>
                    <button onClick={logout} className="dropdown-item">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="dropdown-item">
                      Login
                    </Link>
                    <Link to="/register" className="dropdown-item">
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="nav-cart">
            <Link to="/cart" className="nav-cart-link">
              <CartIcon className="nav-icon" />
              {cartItemCount > 0 && (
                <span className="cart-count">{cartItemCount}</span>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
