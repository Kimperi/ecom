import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1="Latest" text2=" Collection" />
        <p className="w3/4 m-auto sm:text-sm md:text-base text-gray-600">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          quos.
        </p>
      </div>
    </div>
  );
};

export default LatestCollection;
