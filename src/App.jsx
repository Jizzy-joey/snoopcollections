
import { useEffect } from "react";
import {
  Routes,
  Route,
  useLocation,
  Link,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";

import "./App.css";

// Handles scrolling when navigating between pages
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const timer = setTimeout(() => {
        const section = document.getElementById(
          hash.slice(1)
        );

        if (section) {
          section.scrollIntoView({
            behavior: "smooth",
          });
        }
      }, 50);

      return () => clearTimeout(timer);
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <div className="website">
      <ScrollManager />

      {/* Navbar appears on every page */}
      <Navbar />

      {/* Website pages */}
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route path="/cart" element={<Cart />} />

        <Route
          path="*"
          element={
            <main className="product-page">
              <h1>Page not found</h1>
              <Link to="/">Return Home</Link>
            </main>
          }
        />
      </Routes>
    </div>
  );
}
