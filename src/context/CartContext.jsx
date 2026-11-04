
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { shoes } from "../data/shoes";

const CartContext = createContext(null);
const CART_KEY = "snoopcollections-cart";

function getSavedCart() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(CART_KEY) || "[]"
    );
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function findShoe(id) {
  return shoes.find(
    (shoe) => String(shoe.id) === String(id)
  );
}

// Always use the latest catalogue price.
function refreshCart(cart) {
  return cart
    .map((item) => {
      const shoe = findShoe(item.id);

      if (!shoe) return null;

      return {
        id: shoe.id,
        name: shoe.name,
        image: shoe.image,
        price: shoe.price,
        size: item.size,
        quantity: Math.max(
          1,
          Number(item.quantity) || 1
        ),
      };
    })
    .filter(Boolean);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() =>
    refreshCart(getSavedCart())
  );

  useEffect(() => {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify(cart)
    );
  }, [cart]);

  function addToCart(shoe, size, quantity = 1) {
    const amount = Math.max(
      1,
      Number(quantity) || 1
    );

    const currentShoe = findShoe(shoe.id) || shoe;

    setCart((previous) => {
      const updated = refreshCart(previous);

      const existingIndex = updated.findIndex(
        (item) =>
          String(item.id) ===
            String(currentShoe.id) &&
          String(item.size) === String(size)
      );

      if (existingIndex !== -1) {
        return updated.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: item.quantity + amount,
              }
            : item
        );
      }

      return [
        ...updated,
        {
          id: currentShoe.id,
          name: currentShoe.name,
          image: currentShoe.image,
          price: currentShoe.price,
          size,
          quantity: amount,
        },
      ];
    });
  }

  function removeFromCart(id, size) {
    setCart((previous) =>
      previous.filter(
        (item) =>
          !(
            String(item.id) === String(id) &&
            (size === undefined ||
              String(item.size) === String(size))
          )
      )
    );
  }

  function updateQuantity(id, size, quantity) {
    const amount = Number(quantity);

    if (!Number.isFinite(amount)) return;

    if (amount <= 0) {
      removeFromCart(id, size);
      return;
    }

    setCart((previous) =>
      previous.map((item) =>
        String(item.id) === String(id) &&
        String(item.size) === String(size)
          ? {
              ...item,
              quantity: Math.max(
                1,
                Math.floor(amount)
              ),
            }
          : item
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum +
      (typeof item.price === "number"
        ? item.price * item.quantity
        : 0),
    0
  );

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [cart, cartCount, cartTotal]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}
