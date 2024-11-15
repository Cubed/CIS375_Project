import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProductDetail from "./pages/ProductDetail";
import Navbar from "./components/Navbar"; // Updated to use Navbar instead of Header
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext"; // Import AuthProvider

function App() {
  return (
    <CartProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="c/art" element={<CartPage />} />{" "}
          {/* Use CartPage here */}
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
