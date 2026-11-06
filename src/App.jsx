
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import About from "./pages/About";
import Shop from "./pages/Shop";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

import Navbar from "./components/Navbar";

import "./App.css";
import "./Checkout.css";

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Existing store pages */}
        <Route path="/" element={<Home />} />
        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/checkout"
          element={<Checkout />}
        />
        <Route
          path="/payment"
          element={<Payment />}
        />
        <Route path="/about" element={<About />} />
        
        <Route path="/shop" element={<Shop />} />

        {/* New admin pages */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
      </Routes>
    </>
  );
}
