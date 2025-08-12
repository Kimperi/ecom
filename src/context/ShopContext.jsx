// src/context/ShopContext.jsx
import { createContext, useState, useEffect } from "react";
import { products } from "../assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const [search, setSearch] = useState("");
  const [showsearch, setShowsearch] = useState(false);

  // ✅ Load cart from localStorage once
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "{}");
    } catch {
      return {};
    }
  });

  const navigate = useNavigate();

  // ✅ Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Please select a size");
      return;
    }
    const cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    setCartItems(cartData);
    toast.success("Item added to cart!");
  };

  const getCartCount = () => {
    let count = 0;
    for (const item in cartItems) {
      for (const size in cartItems[item]) {
        const n = Number(cartItems[item][size]) || 0;
        if (n > 0) count += n;
      }
    }
    return count;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    const cartData = structuredClone(cartItems);
    const qty = Number(quantity) || 0;

    if (!cartData[itemId]) cartData[itemId] = {};

    if (qty <= 0) {
      // remove that size; if empty, remove the item
      delete cartData[itemId][size];
      if (!Object.keys(cartData[itemId]).length) delete cartData[itemId];
    } else {
      cartData[itemId][size] = qty;
    }

    setCartItems(cartData);
  };

  // NEW: clear cart
  const clearCart = () => {
    setCartItems({});
    try {
      localStorage.setItem("cart", JSON.stringify({}));
    } catch {}
  };

  // NEW: finish order helper (clear + any future logic)
  const finishOrder = () => {
    clearCart();
    // you can add a toast/log here later
  };

  const currency = "MAD ";
  const deliveryFee = 50;

  const value = {
    products,
    currency,
    deliveryFee,
    search,
    setSearch,
    showsearch,
    setShowsearch,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    clearCart, // <-- exposed
    finishOrder, // <-- exposed
    navigate,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
