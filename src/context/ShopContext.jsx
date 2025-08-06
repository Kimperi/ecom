import { createContext, useState } from "react";
import { products } from "../assets/assets";
import { useEffect } from "react";
import { toast } from "react-toastify";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const [search, setSearch] = useState("");
  const [showsearch, setShowsearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const navigate = useNavigate();

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Please select a size");
      return;
    }
    let cartData = structuredClone(cartItems);

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
        try {
          if (cartItems[item][size] > 0) {
            count += Number(cartItems[item][size]);
          }
        } catch (error) {}
      }
    }
    return count;
  };
  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
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
  };
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
