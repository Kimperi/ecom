// src/pages/Orders.jsx
import React from "react";
import Title from "../components/Title";
import { Link } from "react-router-dom";

const Orders = () => {
  return (
    <div className="border-t pt-16 mx-10 md:mx-20 min-h-[60vh]">
      <div className="text-2xl">
        <Title text1="ORDER" text2="CONFIRMED" />
      </div>

      <div className="mt-6 bg-green-50 border border-green-200 rounded p-6">
        <p className="text-gray-900 text-lg font-semibold">
          Your order has been confirmed ✅
        </p>
        <p className="text-gray-700 mt-2">
          Our delivery partner will contact you shortly to arrange delivery.
          Thank you for your Order :)
        </p>
      </div>

      <div className="mt-8">
        <Link
          to="/"
          className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
};

export default Orders;
