import React, { useContext, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";

const BestSeller = () => {
  const { products } = useContext(ShopContext);

  const bestSeller = useMemo(
    () => products.filter((p) => !!p.bestseller).slice(0, 5),
    [products]
  );

  return (
    <div className="my-10">
      <div className="text-center text-3xl py-8">
        <Title text1={"Best"} text2={"SELLERS"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-500">
          Our bestsellers are here — stylish, comfy, and flying off the shelves!
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6 mx-5 md:mx-10">
        {bestSeller.map((item) => (
          <ProductItem
            key={item.id}
            id={item.id}
            image={item.image}
            name={item.name}
            price={item.price}
          />
        ))}
      </div>
    </div>
  );
};

export default BestSeller;
