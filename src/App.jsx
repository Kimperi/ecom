import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import PlaceOrder from "./pages/PlaceOrder";
import Cart from "./pages/Cart";
import Collection from "./pages/Collection";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Product from "./pages/Product";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RequireAuth from "./auth/RequiredAuth";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RequireAdmin from "./routes/RequireAdmin";

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Navbar />

      <Routes>
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          }
        />
        <Route path="/" element={<Home />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route
          path="/cart"
          element={
            <RequireAuth>
              <Cart />
            </RequireAuth>
          }
        />
        <Route path="/collection" element={<Collection />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <Footer />
    </div>
  );
};
export default App;
