
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  STORE,
  formatMoney,
} from "../config/store";
import { getImageUrl } from "../utils/imageUrl";

export default function Cart() {
  const {
    cart,
    cartCount,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const hasPrices =
    STORE.pricesEnabled &&
    cart.length > 0 &&
    cart.every(
      (item) =>
        typeof item.price === "number" &&
        Number.isFinite(item.price) &&
        item.price >= 0
    );

  const subtotal = hasPrices
    ? cart.reduce(
        (sum, item) =>
          sum + item.price * item.quantity,
        0
      )
    : null;

  const total = hasPrices
    ? subtotal + STORE.deliveryFee
    : null;

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <h1>Your Shopping Cart</h1>
          <p>Your basket is currently empty.</p>

          <Link to="/" className="checkout-btn">
            Continue Shopping →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <Link to="/" className="checkout-back">
        ← Continue Shopping
      </Link>

      <div className="checkout-heading">
        <p className="checkout-eyebrow">
          SNOOPCOLLECTIONS / SHOPPING CART
        </p>

        <h1>Your Shopping Cart</h1>

        <p>
          You have {cartCount} sneaker(s) in your
          basket.
        </p>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          <section className="checkout-panel">
            <h2>Your Sneakers</h2>

            <div className="cart-products">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className="cart-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    padding: "20px 0",
                    borderBottom: "1px solid #eee",
                    flexWrap: "wrap",
                  }}
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    style={{
                      width: "110px",
                      height: "110px",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                  />

                  <div
                    style={{
                      flex: 1,
                      minWidth: "170px",
                    }}
                  >
                    <h3>{item.name}</h3>

                    <p>Size: EU {item.size}</p>

                    <p>
                      Unit Price:{" "}
                      <strong>
                        {hasPrices
                          ? formatMoney(item.price)
                          : "To be confirmed"}
                      </strong>
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        margin: "12px 0",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.size,
                            item.quantity - 1
                          )
                        }
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>

                      <strong>{item.quantity}</strong>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.size,
                            item.quantity + 1
                          )
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <p>
                      <strong>
                        Item Total:{" "}
                        {hasPrices
                          ? formatMoney(
                              item.price * item.quantity
                            )
                          : "To be confirmed"}
                      </strong>
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(
                          item.id,
                          item.size
                        )
                      }
                      style={{
                        color: "#d33",
                        marginTop: "10px",
                        cursor: "pointer",
                      }}
                    >
                      Remove Item
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="checkout-outline-btn"
              onClick={clearCart}
              style={{ marginTop: "20px" }}
            >
              Clear Basket
            </button>
          </section>
        </div>

        <aside className="checkout-summary">
          <div className="checkout-panel">
            <h2>Order Summary</h2>

            <div className="order-breakdown">
              <div className="breakdown-row">
                <span>Items</span>
                <strong>{cartCount}</strong>
              </div>

              <div className="breakdown-row">
                <span>Subtotal</span>
                <strong>
                  {hasPrices
                    ? formatMoney(subtotal)
                    : "To be confirmed"}
                </strong>
              </div>

              <div className="breakdown-row">
                <span>Delivery Charge</span>
                <strong>
                  {formatMoney(STORE.deliveryFee)}
                </strong>
              </div>

              <div className="breakdown-divider" />

              <div className="breakdown-row breakdown-total">
                <span>Order Total</span>
                <strong>
                  {hasPrices
                    ? formatMoney(total)
                    : "To be confirmed"}
                </strong>
              </div>
            </div>

            <Link
              to="/checkout"
              className="checkout-btn"
            >
              Proceed to Checkout →
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
