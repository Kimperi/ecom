import React, { useContext, useMemo } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';
import LoadingSpinner from './LoadingSpinner';

const RelatedProduct = ({ category, subCategory, productId }) => {
  const { products, loadingProducts } = useContext(ShopContext);
  const related = useMemo(
    () =>
      products
        .filter(
          (p) => p.id !== productId && p.category === category && p.subCategory === subCategory,
        )
        .slice(0, 5),
    [products, category, subCategory, productId],
  );

  if (loadingProducts) {
    return (
      <div className="mb-20 mx-5">
        <div className="text-center text-3xl py-2">
          <Title text1={'RELATED'} text2={'PRODUCTS'} />
        </div>
        <LoadingSpinner text="Loading related products..." />
      </div>
    );
  }

  return (
    <div className="mb-20 mx-5">
      <div className="text-center text-3xl py-2">
        <Title text1={'RELATED'} text2={'PRODUCTS'} />
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
