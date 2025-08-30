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
  const { getCartCount } = useContext(ShopContext);

  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  async function loadUser() {
    try {
      const s = await fetchAuthSession();
      const id = s?.tokens?.idToken;

      if (!id) {
        setUserName("");
        setIsAdmin(false);
        return;
      }

      const p = id.payload || {};
      let name =
        p.name || p.given_name || p.email || p["cognito:username"] || "";

      const groups = p["cognito:groups"] || [];
      setIsAdmin(Array.isArray(groups) && groups.includes("admin"));

      if (!name) {
        const attrs = await fetchUserAttributes().catch(() => ({}));
        name = attrs?.name || attrs?.given_name || attrs?.email || "";
      }
      setUserName(name || "");
    } catch {
      setUserName("");
      setIsAdmin(false);
    } finally {
      setAuthLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
    const un = Hub.listen("auth", () => loadUser());
    return () => un();
  }, []);

  async function handleLogout() {
    await signOut();
    setUserName("");
    setIsAdmin(false);
    navigate("/", { replace: true });
    setVisible(false);
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

        {!authLoading && isAdmin && (
          <li>
            <NavLink
              to="/admin"
              className="flex flex-col items-center gap-1 hover:text-black transition-colors duration-300"
            >
              <p>ADMIN</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
            </NavLink>
          </li>
        )}
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

      {/* ==== Mobile menu (fixed, overlay + drawer) ==== */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[1100] bg-black/40 transition-opacity duration-300 ${
          Visible
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setVisible(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav
        className={`fixed top-0 right-0 h-screen w-72 max-w-[85vw] z-[1200] bg-white shadow-2xl transition-transform duration-300 ${
          Visible ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col text-gray-600 h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <span className="font-semibold">Menu</span>
            <button
              onClick={() => setVisible(false)}
              className="p-2 -m-2"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-1 p-3">
            <NavLink
              className="py-2 pl-6 border-b border-gray-200"
              to="/"
              onClick={() => setVisible(false)}
            >
              HOME
            </NavLink>
            <NavLink
              className="py-2 pl-6 border-b border-gray-200"
              to="/collection"
              onClick={() => setVisible(false)}
            >
              COLLECTION
            </NavLink>
            <NavLink
              className="py-2 pl-6 border-b border-gray-200"
              to="/about"
              onClick={() => setVisible(false)}
            >
              ABOUT
            </NavLink>
            <NavLink
              className="py-2 pl-6 border-b border-gray-200"
              to="/contact"
              onClick={() => setVisible(false)}
            >
              CONTACT
            </NavLink>

            {!authLoading && isAdmin && (
              <NavLink
                className="py-2 pl-6 border-b border-gray-200"
                to="/admin"
                onClick={() => setVisible(false)}
              >
                ADMIN
              </NavLink>
            )}

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

          <div className="p-4 text-xs text-gray-400 border-t">
            © {new Date().getFullYear()} KIMPERI
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
