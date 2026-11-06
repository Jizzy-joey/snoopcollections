
import { useState } from "react";
import { STORE, createWhatsAppLink, isWhatsAppReady } from "../config/store";
import "./Contact.css";

export default function Contact() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const whatsappReady = isWhatsAppReady();

  const whatsappLink = whatsappReady
    ? createWhatsAppLink(
        "Hello SNOOPCOLLECTIONS! I have a question about your sneakers."
      )
    : "";

  // Optional email: add contactEmail to STORE
  // in src/config/store.js when you have one.
  const email = STORE.contactEmail || "";

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!whatsappReady) {
      setError("WhatsApp contact is not available yet.");
      return;
    }

    if (!name.trim() || !contact.trim() || !message.trim()) {
      setError("Please complete all fields.");
      return;
    }

    const text = [
      "Hello SNOOPCOLLECTIONS!",
      "",
      "CONTACT ENQUIRY",
      `Name: ${name.trim()}`,
      `Contact: ${contact.trim()}`,
      "",
      `Message: ${message.trim()}`,
    ].join("\n");

    const link = createWhatsAppLink(text);

    if (!link) {
      setError("Could not prepare your WhatsApp message.");
      return;
    }

    window.open(link, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="snoop-contact" id="contact">
      <div className="snoop-contact-inner">
        <div className="snoop-contact-intro">
          <span className="snoop-contact-eyebrow">
            SNOOPCOLLECTIONS / GET IN TOUCH
          </span>

          <h2>LET'S TALK SNEAKERS.</h2>

          <p>
            Have questions about sneaker sizes,
            availability, delivery or your order?
            Reach out and let's get you sorted.
          </p>

          <div className="snoop-contact-methods">
            {whatsappReady && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="snoop-contact-method"
              >
                <span className="snoop-contact-method-icon">
                  ↗
                </span>
                <strong>WHATSAPP</strong>
                <small>Chat with our team</small>
              </a>
            )}

            {email && (
              <a
                href={`mailto:${email}`}
                className="snoop-contact-method"
              >
                <span className="snoop-contact-method-icon">
                  ✉
                </span>
                <strong>EMAIL US</strong>
                <small>{email}</small>
              </a>
            )}
          </div>
        </div>

        <div className="snoop-contact-form-wrap">
          <h3>SEND US A MESSAGE</h3>
          <p>
            Fill in your details and continue
            the conversation on WhatsApp.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="snoop-contact-name">
              YOUR NAME
            </label>
            <input
              id="snoop-contact-name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />

            <label htmlFor="snoop-contact-detail">
              EMAIL OR PHONE
            </label>
            <input
              id="snoop-contact-detail"
              type="text"
              placeholder="How can we reach you?"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              required
            />

            <label htmlFor="snoop-contact-message">
              YOUR MESSAGE
            </label>
            <textarea
              id="snoop-contact-message"
              rows="5"
              placeholder="Tell us how we can help..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
            />

            {error && (
              <p className="snoop-contact-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" disabled={!whatsappReady}>
              SEND VIA WHATSAPP ↗
            </button>

            <small className="snoop-contact-note">
              This opens WhatsApp with your message.
              Press Send there to contact our team.
            </small>
          </form>
        </div>
      </div>
    </section>
  );
}
