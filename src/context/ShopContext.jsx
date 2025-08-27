import { createContext, useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { listProducts } from "../lib/productsApi"; // ← API source of truth

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  // ----- products from API -----
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  async function refreshProducts() {
    try {
      setLoadingProducts(true);
      const data = await listProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("[ShopContext] listProducts failed:", e);
      toast.error("Couldn't load products");
    } finally {
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    refreshProducts(); // load once on app start
  }, []);

  // ----- cart persisted in localStorage -----
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  const addToCart = (itemId, size) => {
    if (!size) {
      toast.error("Please select a size");
      return;
    }
    const cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    } else {
      cartData[itemId] = { [size]: 1 };
    }
    setCartItems(cartData);
    toast.success("Item added to cart!");
  };

  const getCartCount = () => {
    let count = 0;
    for (const id in cartItems) {
      const sizes = cartItems[id] || {};
      for (const s in sizes) {
        const n = Number(sizes[s]) || 0;
        if (n > 0) count += n;
      }
    }
    return count;
  };

  const updateQuantity = (itemId, size, quantity) => {
    const q = Math.max(1, Number(quantity) || 1);
    const cartData = structuredClone(cartItems);
    if (!cartData[itemId]) cartData[itemId] = {};
    cartData[itemId][size] = q;
    setCartItems(cartData);
  };

  const clearCart = () => {
    setCartItems({});
    try {
      localStorage.setItem("cart", JSON.stringify({}));
    } catch {}
  };

  const finishOrder = () => clearCart();

  const currency = "MAD";
  const deliveryFee = 50;
  const navigate = useNavigate();

  const value = useMemo(
    () => ({
      // products
      products,
      loadingProducts,
      refreshProducts,

      // cart
      cartItems,
      setCartItems,
      addToCart,
      getCartCount,
      updateQuantity,
      clearCart,
      finishOrder,

      // misc
      currency,
      deliveryFee,
      navigate,
    }),
    [products, loadingProducts, cartItems, currency, deliveryFee, navigate]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
