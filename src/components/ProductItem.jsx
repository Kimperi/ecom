import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

export default function ProductItem({ id, name, price, image }) {
  const thumb = Array.isArray(image)
    ? image[0]
    : typeof image === "string" && image.length > 0
    ? image
    : assets.logo;

  const displayPrice = Number(price);

  return (
    <Link
      to={`/product/${encodeURIComponent(id)}`}
      className="group block bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-800 hover:border-gray-900"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <img
          src={thumb}
          alt={name}
          className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = assets.logo;
          }}
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

        {/* Quick View Badge */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
          <div className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-gray-200">
            Quick View
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5">
        {/* Product Name */}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-3 group-hover:text-gray-900 transition-colors duration-300 leading-tight">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-bold text-gray-900">
            {Number.isFinite(displayPrice) ? `${displayPrice} MAD` : price}
          </div>

          {/* Add to Cart Button */}
          <button className="opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-full transform translate-y-3 group-hover:translate-y-0 shadow-lg hover:shadow-xl">
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
