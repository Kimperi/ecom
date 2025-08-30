import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import LoadingSpinner from "./LoadingSpinner";

const RelatedProduct = ({ category, subCategory }) => {
  const { products, loadingProducts } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length) {
      let copy = products.filter(
        (p) => p.category === category && p.subCategory === subCategory
      );
      setRelated(copy.slice(0, 5));
    }
  }, [products, category, subCategory]);

  if (loadingProducts) {
    return (
      <div className="mb-20 mx-5">
        <div className="text-center text-3xl py-2">
          <Title text1={"RELATED"} text2={"PRODUCTS"} />
        </div>
        <LoadingSpinner text="Loading related products..." />
      </div>
    );
  }

  return (
    <div className="mb-20 mx-5">
      <div className="text-center text-3xl py-2">
        <Title text1={"RELATED"} text2={"PRODUCTS"} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-8">
        {related.map((item) => (
          <ProductItem
            key={item.id}
            id={item.id}
            name={item.name}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProduct;
