import React, { useState } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  const [Visible, setVisible] = useState(false);
  return (
    <div className="flex justify-between items-center py-5 font-medium bg-white shadow-sm px-10">
      <div className="flex-1">
        <img src={assets.logo} className="w-36" alt="logo" />
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
        <img
          src={assets.search_icon}
          alt="search"
          className="w-6 cursor-pointer"
        />

        <div className="group relative">
          <img
            src={assets.profile_icon}
            alt="user"
            className="w-5 cursor-pointer"
          />
          <div className="group-hover:block hidden absolute  dropdown-menu right-2 bottom -[-3px]">
            <div className="flex flex-col gap-2 w-36 py-3 px-2 bg-gray-100 rounded-lg">
              <p className="cursor-pointer hover:text-black transition-colors duration-300">
                My Profile
              </p>
              <p className="cursor-pointer hover:text-black transition-colors duration-300">
                Orders
              </p>
              <p className="cursor-pointer hover:text-black transition-colors duration-300">
                Logout
              </p>
            </div>
          </div>
        </div>
        <Link to="/cart" className="relative">
          <img
            src={assets.cart_icon}
            alt="cart"
            className="w-5 cursor-pointer"
          />
          <p className="absolute top-[-10px] right-[-10px] w-4 h-4 bg-black rounded-full flex items-center justify-center text-white text-xs">
            0
          </p>
        </Link>
        <img
          src={assets.menu_icon}
          alt="menu"
          className="w-5 cursor-pointer md:hidden"
          onClick={() => setVisible(true)}
        />
      </div>
      <div
        className={`absolute top-0 left-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${
          Visible ? "w-full" : "w-0"
        }`}
      >
        <div className="flex flex-col text-gray-600">
          <div className="flex flex-col gap-4 p-3">
            <img
              src={assets.dropdown_icon}
              className="h-4 rotate-180"
              alt="dropdown"
            />
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
              className="py-2 pl-6 border-b border-gray-300"
              to="/collection"
              onClick={() => setVisible(false)}
            >
              COLLECTION
            </NavLink>
            <NavLink
              className="py-2 pl-6 border-b border-gray-300"
              to="/about"
              onClick={() => setVisible(false)}
            >
              ABOUT
            </NavLink>
            <NavLink
              className="py-2 pl-6 border-b border-gray-300"
              to="/contact"
              onClick={() => setVisible(false)}
            >
              CONTACT
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
