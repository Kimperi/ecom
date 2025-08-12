// src/context/ShopContext.jsx
import { createContext, useState, useEffect } from "react";
import { products } from "../assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const [search, setSearch] = useState("");
  const [showsearch, setShowsearch] = useState(false);

  // ✅ Load cart from localStorage on first render
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
    localStorage.setItem("cart", JSON.stringify(cartItems));
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
      cartData[itemId] = { [size]: 1 };
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
    cartData[itemId][size] = Number(quantity);
    setCartItems(cartData);
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
    navigate,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
