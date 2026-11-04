
export const STORE = {
  name: "SNOOPCOLLECTIONS",

  // ADD YOUR REAL WHATSAPP NUMBER HERE
  // Example: 2348012345678
  // Nigerian numbers: replace the first 0 with 234.
  whatsappNumber: "+2348183320048",

  // YOUR BUSINESS BANK DETAILS
  bank: {
    name: "",
    accountName: "",
    accountNumber: "",
  },

  currency: "NGN",
  currencySymbol: "₦",

  // Product prices are now enabled
  pricesEnabled: true,

  // Fixed delivery charge
  deliveryFee: 3500,
};

// =====================================
// NORMALIZE WHATSAPP NUMBER
// =====================================
export function getWhatsAppNumber() {
  let number = String(
    STORE.whatsappNumber || ""
  ).replace(/\D/g, "");

  // Convert local Nigerian numbers to
  // international format automatically.
  if (number.startsWith("0") && number.length === 11) {
    number = "234" + number.slice(1);
  }

  // Handle 2340... entered by mistake.
  if (number.startsWith("2340") && number.length === 14) {
    number = "234" + number.slice(4);
  }

  return number;
}

// =====================================
// CHECK WHATSAPP CONFIGURATION
// =====================================
export function isWhatsAppReady() {
  const number = getWhatsAppNumber();

  return /^[1-9]\d{7,14}$/.test(number);
}

// =====================================
// CHECK BANK DETAILS
// =====================================
export function isBankReady() {
  return Boolean(
    STORE.bank.name.trim() &&
    STORE.bank.accountName.trim() &&
    /^\d{10}$/.test(STORE.bank.accountNumber)
  );
}

// =====================================
// FORMAT NAIRA PRICES
// =====================================
export function formatMoney(amount) {
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount)
  ) {
    return "To be confirmed";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: STORE.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// =====================================
// GENERATE ORDER REFERENCE
// =====================================
export function createOrderReference() {
  const random = Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase();

  return `SNOOP-${Date.now()}-${random}`;
}

// =====================================
// CREATE WHATSAPP ORDER LINK
// =====================================
export function createWhatsAppLink(message) {
  if (!isWhatsAppReady()) {
    return null;
  }

  const number = getWhatsAppNumber();

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

// =====================================
// BUILD ORDER MESSAGE
// =====================================
export function buildOrderMessage(order, type = "whatsapp") {
  const { customer, items, reference } = order;

  const hasPrices =
    STORE.pricesEnabled &&
    items.length > 0 &&
    items.every(
      (item) =>
        typeof item.price === "number" &&
        Number.isFinite(item.price) &&
        item.price >= 0
    );

  const subtotal = hasPrices
    ? items.reduce(
        (sum, item) =>
          sum + item.price * Number(item.quantity),
        0
      )
    : null;

  const total = hasPrices
    ? subtotal + STORE.deliveryFee
    : null;

  const products = items
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
    type === "transfer"
      ? "I am submitting my bank transfer details for verification."
      : "I would like to place an order.",
    "",
    `Order Reference: ${reference}`,
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
    products,
    "",
    "ORDER BREAKDOWN",
    `Subtotal: ${
      hasPrices
        ? formatMoney(subtotal)
        : "To be confirmed"
    }`,
    `Delivery Charge: ${formatMoney(STORE.deliveryFee)}`,
    `Order Total: ${
      hasPrices
        ? formatMoney(total)
        : "To be confirmed"
    }`,
    "",
    type === "transfer"
      ? "Payment status: Awaiting manual verification."
      : "Please confirm availability and order details before payment.",
    "",
    "Thank you!",
  ].join("\n");
}
