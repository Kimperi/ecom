import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <div className="w-full bg-white border-t border-gray-200 mt-10">
      <div className="flex justify-center px-4">
        <div className="flex flex-col md:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-20 text-xs sm:text-sm md:text-base max-w-6xl w-full">
          <div>
            <img src={assets.logo} className="mb-5 w-32" alt="" />
            <p className="w-full md:w-2/3 text-gray-600">
              At KIMPERI, we blend modern trends with timeless style. Our
              mission is to offer quality clothing that makes you feel confident
              and comfortable, every day.
            </p>
          </div>

          <div className=" md:text-left">
            <p className="text-xl font-medium mb-5">COMPANY</p>
            <ul className="flex flex-col gap-1 text-gray-600">
              <li>Home</li>
              <li>About us</li>
              <li>Delivery</li>
              <li>Privacy policy</li>
            </ul>
          </div>

          <div className=" md:text-left">
            <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
            <ul className="flex flex-col gap-1 text-gray-600">
              <li>+212 641672392</li>
              <li>baeljouhari@gmail.com</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
