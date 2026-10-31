
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const {
    cart,
    cartCount,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  return (
    <main className="cart-page">
      <p className="eyebrow">YOUR SELECTION</p>
      <h1>SHOPPING CART.</h1>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is empty.</h2>
          <p>Find your next favourite pair.</p>
          <Link to="/#shop" className="primary-button">
            Explore Collection →
          </Link>
        </div>
      ) : (
        <>
          <p className="cart-summary">
            {cartCount} pair(s) in your cart
          </p>

          <div className="cart-items">
            {cart.map((item) => (
              <article
                className="cart-item"
                key={`${item.id}-${item.size}`}
              >
                <Link to={`/product/${item.id}`}>
                  <img src={item.image} alt={item.name} />
                </Link>

                <div className="cart-item-info">
                  <Link to={`/product/${item.id}`}>
                    <h2>{item.name}</h2>
                  </Link>

                  <p>EU Size: {item.size}</p>

                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.size,
                          item.quantity - 1
                        )
                      }
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.size,
                          item.quantity + 1
                        )
                      }
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="remove-button"
                    onClick={() =>
                      removeFromCart(item.id, item.size)
                    }
                  >
                    Remove item
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="cart-actions">
            <p>
              Prices and checkout will be available once
              product details are confirmed.
            </p>

            <button
              type="button"
              className="clear-cart-button"
              onClick={clearCart}
            >
              Clear Cart
            </button>

            <Link to="/#shop" className="primary-button">
              Continue Shopping
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
