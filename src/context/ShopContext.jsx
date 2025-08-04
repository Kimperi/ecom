import { createContext, useState } from "react";
import { products } from "../assets/assets";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const [search, setSearch] = useState("");
  const [showsearch, setShowsearch] = useState(false);

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
  };
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
