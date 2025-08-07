import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link, useNavigate } from "react-router-dom";

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);
  const navigate = useNavigate();

  const handleClick = () => {
    // Scroll to top before navigation
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Navigate to the product page
    navigate(`/product/${id}`);
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <div className="overflow-hidden">
        <img
          src={image[0]}
          alt=""
          className="hover:scale-105 transition ease-in-out"
        />
      </div>
      <p className="pt-3 pb-1 text-sm">{name}</p>
      <p className="text-sm font-medium">
        {price} {currency}
      </p>
    </div>
  );
};

export default ProductItem;
