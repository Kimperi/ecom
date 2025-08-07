import React, { useState, useContext } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";

function PlaceOrder() {
  const [method, setMethod] = useState("cod");
  const { navigate } = useContext(ShopContext);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  // Error state
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Check if all fields are filled
  const isFormValid = () => {
    return Object.values(formData).every((value) => value.trim() !== "");
  };

  // Validate form and show errors
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.streetAddress.trim())
      newErrors.streetAddress = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "Zip code is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";

    setErrors(newErrors);
    setShowErrors(true);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handlePlaceOrder = () => {
    if (validateForm()) {
      navigate("/orders");
    }
  };

  return (
    <div className="mx-4 sm:mx-20 flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      {/*-------------------left side--------------------------*/}
      <div className="w-full sm:w-[480px] flex flex-col gap-4">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1="Delivery" text2="Address" />
        </div>
        <div className="flex gap-3">
          <div className="w-full">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full border rounded py-1.5 px-3.5 ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="First Name"
              required
            />
            {showErrors && errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>
          <div className="w-full">
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full border rounded py-1.5 px-3.5 ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Last Name"
              required
            />
            {showErrors && errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
        <div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full border rounded py-1.5 px-3.5 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Email"
            required
          />
          {showErrors && errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
        <div>
          <input
            type="number"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full border rounded py-1.5 px-3.5 ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Phone Number"
            required
          />
          {showErrors && errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="streetAddress"
            value={formData.streetAddress}
            onChange={handleInputChange}
            className={`w-full border rounded py-1.5 px-3.5 ${
              errors.streetAddress ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Street Address"
            required
          />
          {showErrors && errors.streetAddress && (
            <p className="text-red-500 text-xs mt-1">{errors.streetAddress}</p>
          )}
        </div>
        <div className="flex gap-3">
          <div className="w-full">
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={`w-full border rounded py-1.5 px-3.5 ${
                errors.city ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="City"
              required
            />
            {showErrors && errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>
          <div className="w-full">
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className={`w-full border rounded py-1.5 px-3.5 ${
                errors.state ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="State"
              required
            />
            {showErrors && errors.state && (
              <p className="text-red-500 text-xs mt-1">{errors.state}</p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-full">
            <input
              type="number"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              className={`w-full border rounded py-1.5 px-3.5 ${
                errors.zipCode ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Zip Code"
              required
            />
            {showErrors && errors.zipCode && (
              <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
            )}
          </div>
          <div className="w-full">
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className={`w-full border rounded py-1.5 px-3.5 ${
                errors.country ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Country"
              required
            />
            {showErrors && errors.country && (
              <p className="text-red-500 text-xs mt-1">{errors.country}</p>
            )}
          </div>
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
              onClick={() => setMethod("paypal")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "paypal" ? "bg-black" : ""
                }`}
              ></p>
              <img className="h-5 mx-4" src={assets.paypal_logo} alt="paypal" />
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
            onClick={handlePlaceOrder}
            className="bg-black text-white px-16 py-3 text-sm cursor-pointer hover:bg-gray-800 transition-all duration-200"
          >
            PLACE ORDER
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlaceOrder;
