// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Import React Query client
import HomePage from "./pages/HomePage";
import ProductDetail from "./pages/ProductDetail";
import Navbar from "./components/Navbar";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProductProvider } from "./contexts/ProductContext"; // Import ProductProvider

const queryClient = new QueryClient(); // Initialize a Query Client

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <QueryClientProvider client={queryClient}>
          <ProductProvider>
            <Router>
              <Navbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Routes>
            </Router>
          </ProductProvider>
        </QueryClientProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
