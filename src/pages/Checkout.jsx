
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  STORE,
  createOrderReference,
  formatMoney,
} from "../config/store";
import { getImageUrl } from "../utils/imageUrl";

const CUSTOMER_KEY = "snoopcollections-customer";
const ORDER_KEY = "snoopcollections-checkout";

function loadCustomer() {
  try {
    return JSON.parse(
      sessionStorage.getItem(CUSTOMER_KEY) || "{}"
    );
  } catch {
    return {};
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartCount } = useCart();

  const [customer, setCustomer] = useState(() => {
    const saved = loadCustomer();

    return {
      fullName: saved.fullName || "",
      phone: saved.phone || "",
      email: saved.email || "",
      address: saved.address || "",
      city: saved.city || "",
      state: saved.state || "",
      notes: saved.notes || "",
    };
  });

  const [paymentMethod, setPaymentMethod] =
    useState("whatsapp");

  const [error, setError] = useState("");

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

  const deliveryFee = STORE.deliveryFee;

  const total = hasPrices
    ? subtotal + deliveryFee
    : null;

  function handleChange(event) {
    const { name, value } = event.target;

    setCustomer((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!cart.length) {
      setError("Your basket is empty.");
      return;
    }

    if (!hasPrices) {
      setError(
        "One or more sneakers are missing a valid price. Please check your product catalogue."
      );
      return;
    }

    const required = [
      "fullName",
      "phone",
      "email",
      "address",
      "city",
      "state",
    ];

    if (
      required.some(
        (field) => !customer[field].trim()
      )
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        customer.email.trim()
      )
    ) {
      setError("Please enter a valid email.");
      return;
    }

    if (
      !/^\+?[\d\s()-]{7,20}$/.test(
        customer.phone.trim()
      )
    ) {
      setError("Please enter a valid phone number.");
      return;
    }

    const cleanCustomer = Object.fromEntries(
      Object.entries(customer).map(
        ([key, value]) => [key, value.trim()]
      )
    );

    const order = {
      reference: createOrderReference(),
      customer: cleanCustomer,

      // IMPORTANT: INCLUDE THE PRICE
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        size: item.size,
        quantity: item.quantity,
      })),

      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      status: "Not submitted",
      createdAt: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem(
        CUSTOMER_KEY,
        JSON.stringify(cleanCustomer)
      );

      sessionStorage.setItem(
        ORDER_KEY,
        JSON.stringify(order)
      );

      navigate("/payment");
    } catch {
      setError("Unable to save your order.");
    }
  }

  if (!cart.length) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <h1>Your Basket Is Empty</h1>
          <p>Add some sneakers to continue.</p>
          <Link to="/" className="checkout-btn">
            Browse Sneakers →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <Link to="/cart" className="checkout-back">
        ← Back to Cart
      </Link>

      <div className="checkout-heading">
        <p className="checkout-eyebrow">
          SNOOPCOLLECTIONS / CHECKOUT
        </p>
        <h1>Checkout</h1>
        <p>Complete your delivery information.</p>
      </div>

      <form
        className="checkout-layout"
        onSubmit={handleSubmit}
      >
        <div className="checkout-main">
          <section className="checkout-panel">
            <div className="checkout-section-title">
              <span className="checkout-step">01</span>
              <div>
                <h2>Customer Information</h2>
                <p>How can we contact you?</p>
              </div>
            </div>

            <div className="checkout-fields">
              <div className="checkout-field">
                <label htmlFor="fullName">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  value={customer.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="phone">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={customer.phone}
                  onChange={handleChange}
                  placeholder="08012345678"
                  required
                />
              </div>

              <div className="checkout-field checkout-full">
                <label htmlFor="email">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={customer.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>
          </section>

          <section className="checkout-panel">
            <div className="checkout-section-title">
              <span className="checkout-step">02</span>
              <div>
                <h2>Delivery Information</h2>
                <p>Where should we deliver?</p>
              </div>
            </div>

            <div className="checkout-fields">
              <div className="checkout-field checkout-full">
                <label htmlFor="address">
                  Delivery Address *
                </label>
                <input
                  id="address"
                  name="address"
                  value={customer.address}
                  onChange={handleChange}
                  placeholder="Street and house number"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="city">
                  City / Area *
                </label>
                <input
                  id="city"
                  name="city"
                  value={customer.city}
                  onChange={handleChange}
                  placeholder="e.g. Yaba"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="state">
                  State *
                </label>
                <input
                  id="state"
                  name="state"
                  value={customer.state}
                  onChange={handleChange}
                  placeholder="e.g. Lagos"
                  required
                />
              </div>

              <div className="checkout-field checkout-full">
                <label htmlFor="notes">
                  Delivery Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="4"
                  value={customer.notes}
                  onChange={handleChange}
                  placeholder="Landmark or delivery instructions"
                />
              </div>
            </div>
          </section>

          <section className="checkout-panel">
            <div className="checkout-section-title">
              <span className="checkout-step">03</span>
              <div>
                <h2>Order Method</h2>
                <p>Choose how to complete your order.</p>
              </div>
            </div>

            <div className="checkout-methods">
              <label
                className={`checkout-method ${
                  paymentMethod === "whatsapp"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="whatsapp"
                  checked={paymentMethod === "whatsapp"}
                  onChange={() =>
                    setPaymentMethod("whatsapp")
                  }
                />
                <span className="method-icon">💬</span>
                <span>
                  <strong>Order via WhatsApp</strong>
                  <small>
                    Send your order details to our team.
                  </small>
                </span>
              </label>

              <label
                className={`checkout-method ${
                  paymentMethod === "transfer"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="transfer"
                  checked={paymentMethod === "transfer"}
                  onChange={() =>
                    setPaymentMethod("transfer")
                  }
                />
                <span className="method-icon">🏦</span>
                <span>
                  <strong>Bank Transfer</strong>
                  <small>
                    Transfer and send confirmation
                    for manual verification.
                  </small>
                </span>
              </label>
            </div>
          </section>
        </div>

        <aside className="checkout-summary">
          <div className="checkout-panel">
            <h2>Your Order</h2>
            <p className="summary-count">
              {cartCount} item(s)
            </p>

            <div className="summary-products">
              {cart.map((item) => (
                <div
                  className="summary-product"
                  key={`${item.id}-${item.size}`}
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                  />
                  <div>
                    <strong>{item.name}</strong>
                    <small>Size: EU {item.size}</small>
                    <small>
                      Quantity: {item.quantity}
                    </small>
                    <small>
                      Unit Price:{" "}
                      {hasPrices
                        ? formatMoney(item.price)
                        : "To be confirmed"}
                    </small>
                    <small>
                      Item Total:{" "}
                      {hasPrices
                        ? formatMoney(
                            item.price * item.quantity
                          )
                        : "To be confirmed"}
                    </small>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-breakdown">
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
                  {formatMoney(deliveryFee)}
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

            {error && (
              <p className="checkout-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="checkout-btn"
              disabled={!hasPrices}
            >
              Continue to Order Review →
            </button>

            {!hasPrices && (
              <p className="checkout-notice">
                Prices are not available for every
                sneaker. Check shoes.js and
                pricesEnabled in store.js.
              </p>
            )}

            <p className="checkout-smallprint">
              No payment is collected here.
            </p>
          </div>
        </aside>
      </form>
    </main>
  );
}
