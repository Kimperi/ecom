import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);
  return (
    <Link to={`/product/${id}`}>
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
    </Link>
  );
};

export default ProductItem;
