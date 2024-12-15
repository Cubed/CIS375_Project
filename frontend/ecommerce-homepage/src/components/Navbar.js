// src/components/Navbar.js
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { ReactComponent as UserIcon } from "../assets/user.svg"; // Ensure you have these SVGs
import { ReactComponent as CartIcon } from "../assets/cart.svg";
import { ReactComponent as SearchIcon } from "../assets/search.svg"; // Add a search SVG in your assets

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const { cartItemCount } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const searchRef = useRef();

  // Debounce timer
  const debounceTimeoutRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
        setShowSuggestions(false);
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

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (query.trim() === "") {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce the API call by 300ms
    debounceTimeoutRef.current = setTimeout(() => {
      fetchSearchResults(query);
    }, 300);
  };

  const fetchSearchResults = async (query) => {
    try {
      const response = await fetch(
        `http://localhost:3001/product/search?query=${encodeURIComponent(
          query
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setShowSuggestions(true);
      } else {
        console.error("Error fetching search results:", response.statusText);
        setSearchResults([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productId) => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSuggestions(false);
    navigate(`/product/${productId}`);
  };

  return (
    <header className="navbar">
      <nav className="nav-container">
        <Link to="/" className="nav-logo">
          E-Commerce
        </Link>
        <div className="nav-search" ref={searchRef}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search products"
            onFocus={() => {
              if (searchResults.length > 0) setShowSuggestions(true);
            }}
          />
          <button type="button" className="search-button" aria-label="Search">
            <SearchIcon className="nav-icon" />
          </button>
          {showSuggestions && searchResults.length > 0 && (
            <div className="search-suggestions">
              {searchResults.map((product) => (
                <div
                  key={product._id}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(product._id)}
                >
                  {product.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="nav-links">
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
