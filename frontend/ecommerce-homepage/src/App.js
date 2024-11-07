import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProductDetail from "./pages/ProductDetail";
import Header from "./components/Header";
import CartPage from "./pages/CartPage"; // Import the CartPage component
import { CartProvider } from "./contexts/CartContext";

function App() {
  return (
    <CartProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />{" "}
          {/* Use CartPage here */}
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
