import { createContext, useState } from "react";
import { products } from "../assets/assets";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = "MAD ";
  const deliveryFee = 50;
  const value = {
    products,
    currency,
    deliveryFee,
  };
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
export default ShopContextProvider;
