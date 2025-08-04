import React from "react";
import { Routes, Route } from "react-router-dom";
import "tailwindcss";

import Home from "./pages/Home";
import PlaceOrder from "./pages/PlaceOrder";
import Cart from "./pages/Cart";
import Collection from "./pages/Collection";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Product from "./pages/Product";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import Footer from "./components/footer";

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes className="px-4 sm: px-[5vw] md: px-[7vw] lg: px-[9vw]">
        <Route path="/" element={<Home />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
      <Footer />
    </div>
  );
};
export default App;
