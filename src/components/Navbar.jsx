import React, { useState, useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import {
  fetchAuthSession,
  fetchUserAttributes,
  signOut,
} from "@aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

const Navbar = () => {
  const [Visible, setVisible] = useState(false);
  const { setShowsearch, showsearch, getCartCount } = useContext(ShopContext);

  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  async function loadUser() {
    try {
      const s = await fetchAuthSession();
      const id = s?.tokens?.idToken;
      if (!id) {
        setUserName("");
        return;
      }
      // try ID token first, then attributes
      const p = id.payload || {};
      let name =
        p.name || p.given_name || p.email || p["cognito:username"] || "";

      if (!name) {
        const attrs = await fetchUserAttributes().catch(() => ({}));
        name = attrs?.name || attrs?.given_name || attrs?.email || "";
      }
      setUserName(name || "");
    } catch {
      setUserName("");
    }
  }

  useEffect(() => {
    loadUser(); // on mount
    const un = Hub.listen("auth", () => loadUser()); // on signIn/signOut
    return () => un();
  }, []);

  async function handleLogout() {
    await signOut();
    setUserName("");
    navigate("/", { replace: true });
  }

  return (
    <div className="flex justify-between items-center py-5 font-medium bg-white shadow-sm md:px-10 px-5 ">
      <div className="flex-1">
        <Link to="/">
          <img src={assets.logo} className="w-36" alt="logo" />
        </Link>
      </div>

      <ul className="hidden md:flex gap-8 text-sm text-gray-700 justify-center flex-1 ">
        <li>
          <NavLink
            to="/"
            className="flex flex-col items-center gap-1 hover:text-black transition-colors duration-300"
          >
            <p>HOME</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/collection"
            className="flex flex-col items-center gap-1 hover:text-black transition-colors duration-300"
          >
            <p>COLLECTION</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/about"
            className="flex flex-col items-center gap-1 hover:text-black transition-colors duration-300"
          >
            <p>ABOUT</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/contact"
            className="flex flex-col items-center gap-1 hover:text-black transition-colors duration-300"
          >
            <p>CONTACT</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
          </NavLink>
        </li>
      </ul>

      <div className="flex items-center gap-5 flex-1 justify-end">
        <div className="group relative flex items-center gap-2">
          {userName ? (
            <>
              <span className="text-sm text-gray-700">Welcome, {userName}</span>
              <button
                onClick={handleLogout}
                className="text-xs text-red-500 hover:underline cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" aria-label="Login">
              <img
                src={assets.profile_icon}
                alt="user"
                className="w-5 cursor-pointer"
              />
            </Link>
          )}
        </div>

        <Link to="/cart" className="relative">
          <img
            src={assets.cart_icon}
            alt="cart"
            className="w-5 cursor-pointer"
          />
          <p className="absolute top-[-10px] right-[-10px] w-4 h-4 bg-black rounded-full flex items-center justify-center text-white text-xs">
            {getCartCount()}
          </p>
        </Link>

        <img
          src={assets.menu_icon}
          alt="menu"
          className="w-5 cursor-pointer md:hidden"
          onClick={() => setVisible(true)}
        />
      </div>

      {/* Mobile menu */}
      <div
        className={`absolute top-0 left-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${
          Visible ? "w-full" : "w-0"
        }`}
      >
        <div className="flex flex-col text-gray-600">
          <div className="flex flex-col gap-4 p-3">
            <div
              onClick={() => setVisible(false)}
              className="flex items-center gap-2 cursor-pointer hover:text-black transition-colors duration-300 border border-gray-300 rounded-lg px-4 py-3 self-start hover:bg-gray-50"
            >
              <img
                src={assets.dropdown_icon}
                className="h-4 -rotate-180"
                alt="back arrow"
              />
              <p className="font-medium text-gray-700">Back</p>
            </div>

            <NavLink
              className="py-2 pl-6 border-b border-gray-300"
              to="/"
              onClick={() => setVisible(false)}
            >
              HOME
            </NavLink>
            <NavLink
              className="py-2 pl-6 border-gray-300 border-b"
              to="/collection"
              onClick={() => setVisible(false)}
            >
              COLLECTION
            </NavLink>
            <NavLink
              className="py-2 pl-6 border-gray-300 border-b"
              to="/about"
              onClick={() => setVisible(false)}
            >
              ABOUT
            </NavLink>
            <NavLink
              className="py-2 pl-6 border-gray-300 border-b"
              to="/contact"
              onClick={() => setVisible(false)}
            >
              CONTACT
            </NavLink>

            {userName ? (
              <div className="py-2 pl-6 flex items-center gap-3">
                <span className="text-sm text-gray-700">
                  Welcome, {userName}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-500 hover:underline cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <NavLink
                className="py-2 pl-6"
                to="/login"
                onClick={() => setVisible(false)}
              >
                LOGIN
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
