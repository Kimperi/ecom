import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets"; // use any placeholder you have

/**
 * Props:
 *  - id: string
 *  - name: string
 *  - price: number | string
 *  - image: string | string[] | undefined
 */
export default function ProductItem({ id, name, price, image }) {
  // Robust thumbnail selection:
  // - array → first item
  // - string → itself
  // - missing → placeholder
  const thumb = Array.isArray(image)
    ? image[0]
    : typeof image === "string" && image.length > 0
    ? image
    : assets.logo; // <-- replace with a nicer placeholder if you have one (e.g., assets.no_image)

  const displayPrice = Number(price);

  return (
    <Link
      to={`/product/${encodeURIComponent(id)}`}
      className="block group rounded border overflow-hidden"
    >
      <div className="aspect-[4/5] bg-gray-50">
        <img
          src={thumb}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
          onError={(e) => {
            // final safety: if the URL 404s, show a placeholder
            e.currentTarget.src = assets.logo; // replace with your placeholder
          }}
        />
      </div>

      <div className="p-3">
        <h3 className="text-sm md:text-base font-medium line-clamp-2">
          {name}
        </h3>
        <div className="mt-1 text-sm md:text-base font-semibold">
          {Number.isFinite(displayPrice) ? `${displayPrice} MAD` : price}
        </div>
      </div>
    </Link>
  );
}
