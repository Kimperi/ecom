import React, { useContext, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import LoadingSpinner from "./LoadingSpinner";

const LatestCollection = () => {
  const { products, loadingProducts } = useContext(ShopContext);

  // show newest first by 'date' if present
  const latestProducts = useMemo(() => {
    const arr = [...products];
    arr.sort((a, b) => Number(b.date || 0) - Number(a.date || 0));
    return arr.slice(0, 10);
  }, [products]);

  if (loadingProducts) {
    return (
      <div id="latest-collection" className="my-16">
        <div className="text-center py-8 text-3xl">
          <Title text1="Latest" text2=" Collection" />
          <p className="w3/4 m-auto sm:text-sm md:text-base text-gray-600">
            Discover our newest arrivals — handpicked styles for every mood,
            every moment. Fashion made effortless.
          </p>
        </div>
        <LoadingSpinner text="Loading latest collection..." />
      </div>
    );
  }

  return (
    <div id="latest-collection" className="my-16">
      <div className="text-center py-8 text-3xl">
        <Title text1="Latest" text2=" Collection" />
        <p className="w3/4 m-auto sm:text-sm md:text-base text-gray-600">
          Discover our newest arrivals — handpicked styles for every mood,
          every moment. Fashion made effortless.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-8 mx-5 md:mx-10">
        {latestProducts.map((item) => (
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

export default LatestCollection;
