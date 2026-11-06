
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { cartCount } = useCart();

  return (
    <header className="navbar">
      <Link to="/" className="logo">
        SNOOP<span>COLLECTIONS.</span>
      </Link>

      <nav aria-label="Main navigation">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/shop">Shop</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>

      <Link to="/cart" className="cart-nav-link">
        <span aria-hidden="true">🛒</span>
        <span>My Cart</span>
        <span className="cart-count">{cartCount}</span>
      </Link>
    </header>
  );
}
