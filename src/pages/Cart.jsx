import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import CartTotal from "../components/CartTotal";

const Cart = () => {
  const {
    cartItems,
    setCartItems,
    products,
    currency,
    updateQuantity,
    navigate, // from context
  } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);

  // --- helpers ---
  const removeItem = (itemId, size) => {
    const next = structuredClone(cartItems);
    if (next[itemId]) {
      delete next[itemId][size];
      if (Object.keys(next[itemId]).length === 0) delete next[itemId];
    }
    setCartItems(next);
  };

  const handleDeleteItem = (itemId, size, productName) => {
    toast.warn(
      <div>
        <p>
          Remove “{productName}” ({size}) from your cart?
        </p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => {
              removeItem(itemId, size);
              toast.success("Item removed from cart!");
              toast.dismiss();
            }}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Yes, Remove
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
      }
    );
  };

  const safeThumb = (image) => {
    const src = Array.isArray(image)
      ? image[0]
      : typeof image === "string"
      ? image
      : assets.logo; // replace with a nicer placeholder if you have one
    return src || assets.logo;
  };

  // build a flat list from cartItems { [id]: { [size]: qty } }
  useEffect(() => {
    const temp = [];
    for (const id in cartItems) {
      const sizes = cartItems[id] || {};
      for (const size in sizes) {
        const q = Number(sizes[size]) || 0;
        if (q > 0) temp.push({ id, size, quantity: q });
      }
    }
    setCartData(temp);
  }, [cartItems]);

  return (
    <div className="border-t pt-14 flex flex-col items-center">
      <div className="text-2xl mb-3 border-b pb-3 md:mx-25 md:mb-10">
        <Title text1={"YOUR "} text2={"CART"} />
      </div>

      <div>
        {cartData.map((item) => {
          const productData = products.find(
            (p) => String(p.id) === String(item.id)
          );

          // If product was deleted or not loaded yet, skip rendering that row
          if (!productData) return null;

          const thumb = safeThumb(productData.image);

          return (
            <div
              key={`${item.id}-${item.size}`}
              className="py-4 mx-25 border-b text-gray-600"
            >
              {/* Mobile Layout */}
              <div className="block md:hidden">
                <div className="flex items-start gap-4">
                  <img className="w-16 h-16 object-cover" src={thumb} alt="" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{productData.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <p>
                        {currency} {Number(productData.price)}
                      </p>
                      <p className="px-2 py-1 border bg-slate-50 text-xs">
                        {item.size}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <input
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || Number(val) <= 0) {
                            removeItem(item.id, item.size);
                          } else {
                            updateQuantity(item.id, item.size, val);
                          }
                        }}
                        className="border w-16 px-2 py-1 text-center"
                        type="number"
                        min={1}
                        defaultValue={item.quantity}
                      />
                      <img
                        onClick={() =>
                          handleDeleteItem(item.id, item.size, productData.name)
                        }
                        src={assets.bin_icon}
                        alt="delete"
                        className="w-5 h-5 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:grid md:grid-cols-[4fr_2fr_0.5fr] md:items-center md:gap-4">
                <div className="flex items-start gap-6">
                  <img className="w-20 h-20 object-cover" src={thumb} alt="" />
                  <div>
                    <p className="text-lg font-medium">{productData.name}</p>
                    <div className="flex items-center gap-5 mt-2">
                      <p>
                        {currency} {Number(productData.price)}
                      </p>
                      <p className="px-3 py-1 border bg-slate-50">
                        {item.size}
                      </p>
                    </div>
                  </div>
                </div>
                <input
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || Number(val) <= 0) {
                      removeItem(item.id, item.size);
                    } else {
                      updateQuantity(item.id, item.size, val);
                    }
                  }}
                  className="border max-w-20 px-2 py-1"
                  type="number"
                  min={1}
                  defaultValue={item.quantity}
                />
                <img
                  onClick={() =>
                    handleDeleteItem(item.id, item.size, productData.name)
                  }
                  src={assets.bin_icon}
                  alt="delete"
                  className="w-5 h-5 cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty cart message */}
      {cartData.length === 0 && (
        <div className="text-center my-20">
          <p className="text-gray-500 text-lg">Your cart is empty</p>
        </div>
      )}

      {/* Totals + checkout */}
      {cartData.length > 0 && (
        <div className="flex justify-end my-20 mx-25 w-full max-w-5xl">
          <div className="w-full sm:w-[450px]">
            <CartTotal />
            <div className="w-full text-end mt-8">
              <button
                onClick={() => navigate("/place-order")}
                className="bg-black text-white text-sm my-8 px-8 py-3 cursor-pointer"
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
