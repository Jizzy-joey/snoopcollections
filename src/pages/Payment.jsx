
import { useState } from "react";
import { Link } from "react-router-dom";

import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import { shoes } from "../data/shoes";
import { getImageUrl } from "../utils/imageUrl";

import {
  STORE,
  isWhatsAppReady,
  isBankReady,
  createWhatsAppLink,
  formatMoney,
} from "../config/store";

const ORDER_KEY = "snoopcollections-checkout";

// Read the order created during checkout.
function loadOrder() {
  try {
    const saved = sessionStorage.getItem(ORDER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Could not load checkout:", error);
    return null;
  }
}

// Convert a shoe image path into a full URL.
// Works with Vercel and GitHub Pages.
function getPublicImageUrl(image) {
  if (!image) return "";

  try {
    const path = getImageUrl(image);
    return new URL(path, window.location.origin).href;
  } catch {
    return "";
  }
}

export default function Payment() {
  const [order] = useState(loadOrder);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [transferReference, setTransferReference] =
    useState("");

  const { clearCart } = useCart();

  // No checkout information available.
  if (
    !order ||
    !order.customer ||
    !Array.isArray(order.items) ||
    order.items.length === 0
  ) {
    return (
      <main className="checkout-page">
        <section className="checkout-panel">
          <h1>No Order Found</h1>
          <p>
            Please add sneakers to your basket and
            complete checkout first.
          </p>
          <Link to="/cart" className="checkout-btn">
            Return to Basket
          </Link>
        </section>
      </main>
    );
  }

  // Refresh sneaker information from the catalogue.
  const items = order.items.map((item) => {
    const shoe = shoes.find(
      (product) =>
        String(product.id) === String(item.id)
    );

    const image = shoe?.image || item.image;

    return {
      ...item,
      name: shoe?.name || item.name,
      price: shoe?.price ?? item.price,
      image,
      imageUrl: getPublicImageUrl(image),
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
          sum +
          item.price * Number(item.quantity),
        0
      )
    : 0;

  const deliveryFee = STORE.deliveryFee;
  const total = subtotal + deliveryFee;

  const isTransfer =
    order.paymentMethod === "transfer";

  const whatsappReady = isWhatsAppReady();
  const bankReady = isBankReady();

  // =====================================
  // BUILD WHATSAPP ORDER MESSAGE
  // =====================================
  function buildMessage() {
    const productLines = items
      .map((item, index) => {
        return [
          `${index + 1}. ${item.name}`,
          `Size: EU ${item.size}`,
          `Quantity: ${item.quantity}`,
          `Unit Price: ${formatMoney(item.price)}`,
          `Item Total: ${formatMoney(
            item.price * Number(item.quantity)
          )}`,
          `Shoe Picture: ${item.imageUrl}`,
        ].join("\n");
      })
      .join("\n\n");

    return [
      `Hello ${STORE.name}!`,
      "",
      "I would like to place an order.",
      "",
      `ORDER REFERENCE: ${order.reference}`,
      "",
      "CUSTOMER INFORMATION",
      `Name: ${order.customer.fullName}`,
      `Phone: ${order.customer.phone}`,
      `Email: ${
        order.customer.email || "Not provided"
      }`,
      "",
      "DELIVERY INFORMATION",
      `Address: ${order.customer.address}`,
      `City: ${order.customer.city}`,
      `State: ${order.customer.state}`,
      `Notes: ${
        order.customer.notes || "None"
      }`,
      "",
      "SNEAKERS ORDERED",
      productLines,
      "",
      "ORDER BREAKDOWN",
      `Subtotal: ${formatMoney(subtotal)}`,
      `Delivery Fee: ${formatMoney(deliveryFee)}`,
      `TOTAL: ${formatMoney(total)}`,
      "",
      `Payment Method: ${
        isTransfer
          ? "Bank Transfer"
          : "WhatsApp Order"
      }`,
      ...(isTransfer
        ? [
            `Transfer Reference: ${
              transferReference.trim() ||
              "Not provided"
            }`,
            "Payment awaiting manual verification.",
          ]
        : [
            "Please confirm availability and payment instructions.",
          ]),
      "",
      "Thank you!",
    ].join("\n");
  }

  // =====================================
  // SAVE ORDER TO SUPABASE
  // =====================================
  async function saveOrderToSupabase() {
    const payload = {
      reference: order.reference,

      customer: {
        fullName: order.customer.fullName,
        phone: order.customer.phone,
        email: order.customer.email || "",
        address: order.customer.address,
        city: order.customer.city,
        state: order.customer.state,
        notes: order.customer.notes || "",
      },

      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        image_url: item.imageUrl,
        size: item.size,
        quantity: Number(item.quantity),
        price: item.price,
      })),

      subtotal,
      delivery_fee: deliveryFee,
      total,
      payment_method: order.paymentMethod,
      status: "Pending",
    };

    console.log("Submitting order to Supabase:", {
      reference: payload.reference,
      itemCount: payload.items.length,
      total: payload.total,
    });

    const { error: saveError } = await supabase
      .from("orders")
      .insert(payload);

    if (saveError) {
      console.error("SUPABASE ORDER ERROR:", {
        message: saveError.message,
        code: saveError.code,
        details: saveError.details,
        hint: saveError.hint,
      });

      // A duplicate reference may mean the order
      // was saved during an earlier attempt.
      // Do not assume success without verifying it.
      throw saveError;
    }

    return true;
  }

  // =====================================
  // SUBMIT ORDER AND OPEN WHATSAPP
  // =====================================
  async function submitOrder() {
    if (saving || submitted) return;

    setError("");

    if (!hasPrices) {
      setError(
        "One or more sneaker prices are missing or invalid."
      );
      return;
    }

    if (!whatsappReady) {
      setError(
        "The store WhatsApp number is not configured correctly."
      );
      return;
    }

    if (isTransfer && !bankReady) {
      setError(
        "Bank transfer details are not configured."
      );
      return;
    }

    const link = createWhatsAppLink(
      buildMessage()
    );

    if (!link) {
      setError(
        "Unable to generate the WhatsApp order link."
      );
      return;
    }

    setSaving(true);

    try {
      // First save the order.
      await saveOrderToSupabase();

      // Only clear after successful database save.
      clearCart();

      // Remove the pending checkout record.
      sessionStorage.removeItem(ORDER_KEY);

      setWhatsappUrl(link);
      setSubmitted(true);

      // Redirect to WhatsApp.
      window.location.assign(link);
    } catch (err) {
      console.error(
        "ORDER SUBMISSION FAILED:",
        err
      );

      // Show the real error during development.
      // Use a generic customer-facing error
      // before launching publicly.
      setError(
        `Unable to save order: ${
          err?.message || "Unknown error"
        }${
          err?.code
            ? ` (Code: ${err.code})`
            : ""
        }`
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================
  // SUCCESS SCREEN
  // =====================================
  if (submitted) {
    return (
      <main className="checkout-page">
        <section className="checkout-panel">
          <h1>Order Saved Successfully!</h1>

          <p>
            Your order reference is:
          </p>

          <h2>{order.reference}</h2>

          <p>
            Your order has been saved and your
            shopping basket has been cleared.
          </p>

          <p>
            Please open WhatsApp and press Send
            to notify our team.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="checkout-btn"
          >
            Open WhatsApp Again →
          </a>

          <p>
            <Link to="/">
              Continue Shopping
            </Link>
          </p>
        </section>
      </main>
    );
  }

  // =====================================
  // ORDER REVIEW PAGE
  // =====================================
  return (
    <main className="checkout-page">
      <Link
        to="/checkout"
        className="checkout-back"
      >
        ← Back to Checkout
      </Link>

      <div className="checkout-heading">
        <p className="checkout-eyebrow">
          SNOOPCOLLECTIONS / ORDER REVIEW
        </p>

        <h1>Complete Your Order</h1>

        <p>
          Review your sneakers and delivery
          details before submitting.
        </p>

        <p>
          <strong>Order Reference:</strong>{" "}
          {order.reference}
        </p>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          {/* CUSTOMER DETAILS */}
          <section className="checkout-panel">
            <div className="checkout-section-title">
              <span className="checkout-step">
                01
              </span>

              <div>
                <h2>Customer Details</h2>
                <p>Review your information.</p>
              </div>
            </div>

            <div className="review-details">
              <p>
                <strong>Name:</strong>{" "}
                {order.customer.fullName}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {order.customer.phone}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {order.customer.email || "N/A"}
              </p>

              <p>
                <strong>Address:</strong>{" "}
                {order.customer.address}
              </p>

              <p>
                <strong>City:</strong>{" "}
                {order.customer.city}
              </p>

              <p>
                <strong>State:</strong>{" "}
                {order.customer.state}
              </p>

              {order.customer.notes && (
                <p>
                  <strong>Notes:</strong>{" "}
                  {order.customer.notes}
                </p>
              )}
            </div>
          </section>

          {/* SNEAKERS */}
          <section className="checkout-panel">
            <div className="checkout-section-title">
              <span className="checkout-step">
                02
              </span>

              <div>
                <h2>Sneakers Ordered</h2>
                <p>
                  Pictures and prices of your items.
                </p>
              </div>
            </div>

            <div className="summary-products">
              {items.map((item) => (
                <div
                  className="summary-product"
                  key={`${item.id}-${item.size}`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{
                      width: "110px",
                      height: "110px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />

                  <div>
                    <strong>{item.name}</strong>

                    <p>Size: EU {item.size}</p>

                    <p>
                      Quantity: {item.quantity}
                    </p>

                    <p>
                      Unit Price:{" "}
                      {formatMoney(item.price)}
                    </p>

                    <p>
                      Item Total:{" "}
                      {formatMoney(
                        item.price *
                        Number(item.quantity)
                      )}
                    </p>

                    {item.imageUrl && (
                      <a
                        href={item.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Shoe Picture
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PAYMENT */}
          {isTransfer && (
            <section className="checkout-panel">
              <div className="checkout-section-title">
                <span className="checkout-step">
                  03
                </span>

                <div>
                  <h2>Bank Transfer</h2>
                  <p>
                    Payment requires manual
                    verification.
                  </p>
                </div>
              </div>

              {bankReady ? (
                <div className="bank-details">
                  <p>
                    <strong>Bank:</strong>{" "}
                    {STORE.bank.name}
                  </p>

                  <p>
                    <strong>Account Name:</strong>{" "}
                    {STORE.bank.accountName}
                  </p>

                  <p>
                    <strong>Account Number:</strong>{" "}
                    {STORE.bank.accountNumber}
                  </p>

                  <div className="checkout-field">
                    <label htmlFor="transfer-ref">
                      Transaction Reference
                      (Optional)
                    </label>

                    <input
                      id="transfer-ref"
                      type="text"
                      value={transferReference}
                      onChange={(event) =>
                        setTransferReference(
                          event.target.value
                        )
                      }
                      placeholder="Enter transfer reference"
                    />
                  </div>
                </div>
              ) : (
                <p className="checkout-warning">
                  Bank details are not configured.
                </p>
              )}
            </section>
          )}

          {/* SUBMIT ORDER */}
          <section className="checkout-panel">
            <div className="checkout-section-title">
              <span className="checkout-step">
                {isTransfer ? "04" : "03"}
              </span>

              <div>
                <h2>Submit Your Order</h2>
                <p>
                  Save your order and continue
                  to WhatsApp.
                </p>
              </div>
            </div>

            <p className="checkout-notice">
              Once your order is saved,
              your basket will be cleared.
              You must still send the prepared
              WhatsApp message.
            </p>

            {error && (
              <p
                className="checkout-warning"
                role="alert"
                style={{
                  color: "#b42318",
                  padding: "12px",
                  border: "1px solid #f1b0b7",
                  borderRadius: "8px",
                  overflowWrap: "anywhere",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="button"
              className="checkout-btn"
              onClick={submitOrder}
              disabled={saving}
            >
              {saving
                ? "Saving Your Order..."
                : "Save Order & Open WhatsApp →"}
            </button>
          </section>
        </div>

        {/* ORDER SUMMARY */}
        <aside className="checkout-summary">
          <div className="checkout-panel">
            <h2>Order Breakdown</h2>

            <p className="summary-count">
              Review your final total.
            </p>

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
                <span>Total</span>

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
