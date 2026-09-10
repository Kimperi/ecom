import { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { listProducts } from '../lib/productsApi';
import { sanitizeCart, validQuantity, validKey, CURRENCY, DELIVERY_FEE } from '../lib/validation';
import { isDemo } from '../config';

export const ShopContext = createContext();
const CART_KEY = `kimperi.${isDemo ? 'demo' : 'aws'}.cart.v1`;

export default function ShopContextProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cartItems, setCartItems] = useState(() => {
    try {
      return sanitizeCart(JSON.parse(localStorage.getItem(CART_KEY) || '{}'));
    } catch {
      return {};
    }
  });
  const navigate = useNavigate();
  const refreshProducts = useCallback(async () => {
    try {
      const result = await listProducts();
      setProducts(Array.isArray(result) ? result : []);
    } catch {
      toast.error('Could not load products. Check the selected app mode and configuration.');
    } finally {
      setLoadingProducts(false);
    }
  }, []);
  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    } catch {
      /* Storage can be unavailable in private browsing. */
    }
  }, [cartItems]);

  const addToCart = useCallback(
    (id, size) => {
      const product = products.find((p) => String(p.id) === String(id));
      if (!validKey(String(id)) || !validKey(size) || !product?.sizes?.includes(size)) {
        toast.error('Please select an available size.');
        return;
      }
      const quantity = (cartItems[id]?.[size] || 0) + 1;
      if (!validQuantity(quantity)) {
        toast.error('Maximum quantity is 99 per size.');
        return;
      }
      setCartItems((previous) => ({ ...previous, [id]: { ...previous[id], [size]: quantity } }));
      toast.success('Item added to cart.');
    },
    [products, cartItems],
  );
  const updateQuantity = useCallback((id, size, quantity) => {
    const q = Number(quantity);
    if (!validKey(String(id)) || !validKey(size) || !validQuantity(q)) {
      toast.error('Use a whole-number quantity from 1 to 99.');
      return;
    }
    setCartItems((previous) => ({ ...previous, [id]: { ...previous[id], [size]: q } }));
  }, []);
  const clearCart = useCallback(() => setCartItems({}), []);
  const getCartCount = useCallback(
    () =>
      Object.values(cartItems).reduce(
        (total, sizes) => total + Object.values(sizes).reduce((sum, q) => sum + q, 0),
        0,
      ),
    [cartItems],
  );
  const value = useMemo(
    () => ({
      products,
      loadingProducts,
      refreshProducts,
      cartItems,
      setCartItems,
      addToCart,
      updateQuantity,
      getCartCount,
      clearCart,
      finishOrder: clearCart,
      currency: CURRENCY,
      deliveryFee: DELIVERY_FEE,
      navigate,
    }),
    [
      products,
      loadingProducts,
      refreshProducts,
      cartItems,
      addToCart,
      updateQuantity,
      getCartCount,
      clearCart,
      navigate,
    ],
  );
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
