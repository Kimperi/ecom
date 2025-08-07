import React, { useState, useContext } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";

function PlaceOrder() {
  const [method, setMethod] = useState("cod");
  const { navigate } = useContext(ShopContext);

  return (
    <div className="mx-4 sm:mx-20 flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      {/*-------------------left side--------------------------*/}
      <div className="w-full sm:w-[480px] flex flex-col gap-4">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1="Delivery" text2="Address" />
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            className="w-full border border-gray-300 rounded py-1.5 px-3.5 w-full"
            placeholder="First Name"
          />
          <input
            type="text"
            className="w-full border border-gray-300 rounded py-1.5 px-3.5 w-full"
            placeholder="Last Name"
          />
        </div>
        <input
          type="email"
          className="w-full border border-gray-300 rounded py-1.5 px-3.5 w-full"
          placeholder="Email"
          required
        />
        <input
          type="number"
          className="w-full border border-gray-300 rounded py-1.5 px-3.5 w-full"
          placeholder="Phone Number"
          required
        />
        <input
          type="text"
          className="w-full border border-gray-300 rounded py-1.5 px-3.5 w-full"
          placeholder="Street Address"
          required
        />
        <div className="flex gap-3">
          <input
            type="text"
            className="w-full border border-gray-300 rounded py-1.5 px-3.5 w-full"
            placeholder="City"
            required
          />
          <input
            type="text"
            className="w-full border border-gray-300 rounded py-1.5 px-3.5 w-full"
            placeholder="State"
            required
          />
        </div>
        <div className="flex gap-3">
          <input
            type="number"
            className="w-full border border-gray-300 rounded py-1.5 px-3.5 w-full"
            placeholder="Zip Code"
            required
          />
          <input
            type="text"
            className="w-full border border-gray-300 rounded py-1.5 px-3.5 w-full"
            placeholder="Country"
            required
          />
        </div>
      </div>
      {/*-------------------right side--------------------------*/}
      <div className="w-full sm:w-[480px] mt-8 sm:mt-0 flex flex-col">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>
        <div className="mt-12">
          <Title text1="Payment" text2="Method" />
          {/*----------Payment Method--------------*/}
          <div className="flex gap-3 flex-col lg:flex-row">
            <div
              onClick={() => setMethod("stripe")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "stripe" ? "bg-black" : ""
                }`}
              ></p>
              <img className="h-5 mx-4" src={assets.stripe_logo} alt="stripe" />
            </div>
            <div
              onClick={() => setMethod("razorpay")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "razorpay" ? "bg-black" : ""
                }`}
              ></p>
              <img
                className="h-5 mx-4"
                src={assets.razorpay_logo}
                alt="razorpay"
              />
            </div>
            <div
              onClick={() => setMethod("cod")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "cod" ? "bg-black" : ""
                }`}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4">
                CASH ON DELIVERY
              </p>
            </div>
          </div>
        </div>
        <div className="w-full text-end mt-8">
          <button
            onClick={() => navigate("/orders")}
            className="bg-black text-white px-16 py-3 text-sm cursor-pointer"
          >
            PLACE ORDER
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlaceOrder;
