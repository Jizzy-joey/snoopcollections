
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  STORE,
  isWhatsAppReady,
  isBankReady,
  createWhatsAppLink,
  formatMoney,
} from "../config/store";
import { getImageUrl } from "../utils/imageUrl";
import { shoes } from "../data/shoes";

const ORDER_KEY = "snoopcollections-checkout";

function loadOrder() {
  try {
    const saved = sessionStorage.getItem(ORDER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export default function Payment() {
  const [order] = useState(loadOrder);
  const [copied, setCopied] = useState(false);
  const [transferReference, setTransferReference] =
    useState("");
  const [error, setError] = useState("");

  if (
    !order ||
    !Array.isArray(order.items) ||
    order.items.length === 0 ||
    !order.customer
  ) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <h1>No Order Found</h1>
          <p>Please complete checkout first.</p>
          <Link to="/cart" className="checkout-btn">
            Return to Cart
          </Link>
        </div>
      </main>
    );
  }

  // Load current sneaker prices.
  const items = order.items.map((item) => {
    const shoe = shoes.find(
      (product) =>
        String(product.id) === String(item.id)
    );

    return {
      ...item,
      price: shoe ? shoe.price : item.price,
    };
  });

  const hasPrices =
    STORE.pricesEnabled &&
    items.every(
      (item) =>
        typeof item.price === "number" &&
        Number.isFinite(item.price) &&
        item.price >= 0 &&
        Number.isInteger(Number(item.quantity)) &&
        Number(item.quantity) > 0
    );

  const subtotal = hasPrices
    ? items.reduce(
        (sum, item) =>
          sum + item.price * Number(item.quantity),
        0
      )
    : null;

  const deliveryFee = STORE.deliveryFee;
  const total = hasPrices
    ? subtotal + deliveryFee
    : null;

  const isTransfer =
    order.paymentMethod === "transfer";

  const whatsappReady = isWhatsAppReady();
  const bankReady = isBankReady();

  const customer = order.customer;

  // =====================================
  // BUILD WHATSAPP MESSAGE
  // =====================================
  function buildMessage() {
    const productLines = items
      .map((item, index) =>
        [
          `${index + 1}. ${item.name}`,
          `Size: EU ${item.size}`,
          `Quantity: ${item.quantity}`,
          `Unit Price: ${
            hasPrices
              ? formatMoney(item.price)
              : "To be confirmed"
          }`,
          `Item Total: ${
            hasPrices
              ? formatMoney(
                  item.price * Number(item.quantity)
                )
              : "To be confirmed"
          }`,
        ].join("\n")
      )
      .join("\n\n");

    return [
      `Hello ${STORE.name}!`,
      "",
      isTransfer
        ? "I would like to submit a bank transfer confirmation for manual verification."
        : "I would like to place an order.",
      "",
      `ORDER REFERENCE: ${order.reference}`,
      "",
      "CUSTOMER INFORMATION",
      `Name: ${customer.fullName}`,
      `Phone: ${customer.phone}`,
      `Email: ${customer.email}`,
      "",
      "DELIVERY INFORMATION",
      `Address: ${customer.address}`,
      `City: ${customer.city}`,
      `State: ${customer.state}`,
      `Notes: ${customer.notes || "None"}`,
      "",
      "ORDER ITEMS",
      productLines,
      "",
      "ORDER BREAKDOWN",
      `Subtotal: ${
        hasPrices
          ? formatMoney(subtotal)
          : "To be confirmed"
      }`,
      `Delivery: ${formatMoney(deliveryFee)}`,
      `TOTAL: ${
        hasPrices
          ? formatMoney(total)
          : "To be confirmed"
      }`,
      "",
      ...(isTransfer
        ? [
            "BANK TRANSFER CONFIRMATION",
            `Transaction Reference: ${
              transferReference.trim() ||
              "Not supplied"
            }`,
            "Payment Status: Awaiting verification",
          ]
        : [
            "Please confirm availability and",
            "order details before payment.",
          ]),
      "",
      "Thank you!",
    ].join("\n");
  }

  // =====================================
  // OPEN WHATSAPP
  // =====================================
  function openWhatsApp() {
    setError("");

    if (!whatsappReady) {
      setError(
        "WhatsApp is not configured. Please check the business number in src/config/store.js."
      );
      return;
    }

    if (!hasPrices) {
      setError(
        "Some product prices are missing. Please check your order."
      );
      return;
    }

    if (isTransfer && !bankReady) {
      setError(
        "Bank transfer details have not been configured."
      );
      return;
    }

    const link = createWhatsAppLink(
      buildMessage()
    );

    if (!link) {
      setError(
        "Unable to create the WhatsApp link."
      );
      return;
    }

    window.location.assign(link);
  }

  // =====================================
  // COPY BANK ACCOUNT NUMBER
  // =====================================
  async function copyAccountNumber() {
    if (!bankReady) return;

    try {
      await navigator.clipboard.writeText(
        STORE.bank.accountNumber
      );
      setCopied(true);
    } catch {
      setError(
        "Unable to copy the account number."
      );
    }
  }

  return (
    <main className="checkout-page">
      <Link
        to="/checkout"
        className="checkout-back"
      >
        ← Edit Customer Details
      </Link>

      <div className="checkout-heading">
        <p className="checkout-eyebrow">
          SNOOPCOLLECTIONS / ORDER REVIEW
        </p>

        <h1>Complete Your Order</h1>

        <p>
          Review your sneakers, prices,
          delivery details and payment method.
        </p>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          {/* ORDER REFERENCE */}
          <section className="checkout-panel">
            <div className="checkout-section-title">
              <span className="checkout-step">01</span>
              <div>
                <h2>Order Reference</h2>
                <p>Keep this for enquiries.</p>
              </div>
            </div>

            <div className="order-reference">
              {order.reference}
            </div>

            <p className="checkout-notice">
              Your order is not confirmed until
              our team acknowledges it.
            </p>
          </section>

          {/* CUSTOMER DETAILS */}
          <section className="checkout-panel">
            <div className="checkout-section-title">
              <span className="checkout-step">02</span>
              <div>
                <h2>Customer Details</h2>
                <p>Review your delivery information.</p>
              </div>
            </div>

            <div className="review-details">
              <p>
                <strong>Name:</strong>{" "}
                {customer.fullName}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {customer.phone}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                {customer.email}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {customer.address}
              </p>
              <p>
                <strong>City:</strong>{" "}
                {customer.city}
              </p>
              <p>
                <strong>State:</strong>{" "}
                {customer.state}
              </p>
              {customer.notes && (
                <p>
                  <strong>Notes:</strong>{" "}
                  {customer.notes}
                </p>
              )}
            </div>
          </section>

          {/* ORDER / PAYMENT METHOD */}
          {isTransfer ? (
            <section className="checkout-panel">
              <div className="checkout-section-title">
                <span className="checkout-step">03</span>
                <div>
                  <h2>Bank Transfer</h2>
                  <p>
                    Transfer and submit confirmation.
                  </p>
                </div>
              </div>

              {bankReady ? (
                <div className="bank-details">
                  <div>
                    <small>Bank Name</small>
                    <strong>
                      {STORE.bank.name}
                    </strong>
                  </div>

                  <div>
                    <small>Account Name</small>
                    <strong>
                      {STORE.bank.accountName}
                    </strong>
                  </div>

                  <div>
                    <small>Account Number</small>
                    <strong>
                      {STORE.bank.accountNumber}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="checkout-outline-btn"
                    onClick={copyAccountNumber}
                  >
                    {copied
                      ? "Account Number Copied ✓"
                      : "Copy Account Number"}
                  </button>
                </div>
              ) : (
                <p className="checkout-warning">
                  Bank details are not configured.
                </p>
              )}

              <div className="checkout-field">
                <label htmlFor="transferReference">
                  Transaction Reference (Optional)
                </label>

                <input
                  id="transferReference"
                  type="text"
                  value={transferReference}
                  onChange={(event) =>
                    setTransferReference(
                      event.target.value
                    )
                  }
                  placeholder="Enter transaction reference"
                />
              </div>

              <p className="checkout-notice">
                Payment is subject to manual
                verification. Sending a reference
                does not confirm payment.
              </p>

              <button
                type="button"
                className="checkout-btn"
                onClick={openWhatsApp}
              >
                Confirm Transfer via WhatsApp →
              </button>
            </section>
          ) : (
            <section className="checkout-panel">
              <div className="checkout-section-title">
                <span className="checkout-step">03</span>
                <div>
                  <h2>Order via WhatsApp</h2>
                  <p>
                    Send your complete order to
                    our team.
                  </p>
                </div>
              </div>

              <p className="checkout-notice">
                Your WhatsApp message will include
                your sneakers, prices, delivery
                charge and total.
              </p>

              <button
                type="button"
                className="checkout-btn"
                onClick={openWhatsApp}
              >
                Send Order via WhatsApp →
              </button>

              <p className="checkout-smallprint">
                You must press Send in WhatsApp
                to submit your order.
              </p>
            </section>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <p
              className="checkout-warning"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        {/* ORDER BREAKDOWN */}
        <aside className="checkout-summary">
          <div className="checkout-panel">
            <h2>Order Breakdown</h2>

            <p className="summary-count">
              Review your sneakers and final total.
            </p>

            <div className="summary-products">
              {items.map((item) => (
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

                    <small>
                      Size: EU {item.size}
                    </small>

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
                            item.price *
                            Number(item.quantity)
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

            <Link
              to="/cart"
              className="checkout-outline-btn"
            >
              Edit Basket
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
