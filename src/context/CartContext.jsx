
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext(null);

// Load saved cart from browser storage
function loadCart() {
  try {
    const savedCart = localStorage.getItem(
      "snoopcollections-cart"
    );

    if (!savedCart) return [];

    const parsedCart = JSON.parse(savedCart);

    return Array.isArray(parsedCart)
      ? parsedCart
      : [];
  } catch (error) {
    console.error("Error loading cart:", error);
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);

  // Save cart whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "snoopcollections-cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  // Add product to cart
  const addToCart = (shoe, size, quantity = 1) => {
    setCart((previousCart) => {
      const existingItem = previousCart.find(
        (item) =>
          item.id === shoe.id &&
          item.size === size
      );

      if (existingItem) {
        return previousCart.map((item) =>
          item.id === shoe.id &&
          item.size === size
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      return [
        ...previousCart,
        {
          id: shoe.id,
          name: shoe.name,
          image: shoe.image,
          size,
          quantity,
        },
      ];
    });
  };

  // Remove a product
  const removeFromCart = (id, size) => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) =>
          !(item.id === id && item.size === size)
      )
    );
  };

  // Increase or decrease quantity
  const updateQuantity = (id, size, quantity) => {
    if (quantity < 1) {
      removeFromCart(id, size);
      return;
    }

    setCart((previousCart) =>
      previousCart.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Empty the cart
  const clearCart = () => {
    setCart([]);
  };

  // Total number of items
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook for accessing the cart
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}
