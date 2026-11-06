
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { shoes } from "../data/shoes";
import { useCart } from "../context/CartContext";

const demoSizes = [39, 40, 41, 42, 43, 44, 45];

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const shoe = shoes.find(
    (item) => String(item.id) === id
  );

  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  if (!shoe) {
    return (
      <main className="product-page">
        <h1>Product not found</h1>
        <Link to="/">Back to shop</Link>
      </main>
    );
  }

  const handleAddToCart = () => {
    if (!size) {
      setMessage("Please select your shoe size.");
      return;
    }

    addToCart(shoe, size, quantity);
    setMessage(`${quantity} pair(s) added to your cart!`);
  };

  return (
    <main className="product-page">
      <Link to="/shop" className="back-link">
        ← Back to collection
      </Link>

      <div className="product-layout">
        <div className="product-image-large">
          <img src={shoe.image} alt={shoe.name} />
        </div>

        <div className="product-information">
          <p className="eyebrow">SNOOPCOLLECTIONS</p>
          <h1>{shoe.name}</h1>

          <p className="product-description">
            Discover this standout sneaker from our
            collection. Choose your preferred size and
            add it to your shopping cart.
          </p>

          <p className="price-placeholder">
            Price to be confirmed
          </p>

          <h3>Select your size (EU)</h3>
          <p className="demo-note">
            Demo sizes — availability not yet confirmed.
          </p>

          <div className="size-options">
            {demoSizes.map((option) => (
              <button
                type="button"
                key={option}
                className={
                  size === String(option)
                    ? "size-button selected"
                    : "size-button"
                }
                onClick={() => {
                  setSize(String(option));
                  setMessage("");
                }}
              >
                {option}
              </button>
            ))}
          </div>

          <h3>Quantity</h3>

          <div className="quantity-control">
            <button
              type="button"
              onClick={() =>
                setQuantity((q) => Math.max(1, q - 1))
              }
              aria-label="Decrease quantity"
            >
              −
            </button>

            <span>{quantity}</span>

            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            className="add-cart-button"
            onClick={handleAddToCart}
          >
            Add to Cart 🛒
          </button>

          {message && (
            <p className="cart-feedback" role="status">
              {message}
            </p>
          )}

          <Link to="/cart" className="view-cart-link">
            View Shopping Cart →
          </Link>
        </div>
      </div>
    </main>
  );
}
