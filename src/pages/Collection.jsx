import React, { useContext, useState, useEffect, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

const Collection = () => {
  const { products } = useContext(ShopContext);

  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([
    "Men",
    "Women",
    "Kids",
  ]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([
    "Topwear",
    "Bottomwear",
    "Winterwear",
  ]);
  const [sortBy, setSortBy] = useState("relevant");

  const Toggle = (e) => {
    const v = e.target.value;
    setSelectedCategories((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };

  const ToggleSubCategory = (e) => {
    const v = e.target.value;
    setSelectedSubCategories((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };

  const sortProducts = (e) => setSortBy(e.target.value);

  // compute filtered + sorted without mutating original array
  const filterProducts = useMemo(() => {
    let arr = products.filter(
      (p) =>
        selectedCategories.includes(p.category) &&
        selectedSubCategories.includes(p.subCategory)
    );

    if (sortBy === "low-high") {
      arr = [...arr].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "high-low") {
      arr = [...arr].sort((a, b) => Number(b.price) - Number(a.price));
    }
    // "relevant" keeps original order (from API)
    return arr;
  }, [products, selectedCategories, selectedSubCategories, sortBy]);

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
      {/* Left filters */}
      <div className="min-w-60 md:ml-4 ml-2">
        <p
          className="text-xl flex items-center cursor-pointer gap-2 my-5 ml-6"
          onClick={() => setShowFilter(!showFilter)}
        >
          FILTERS
          <img
            className={`h-3 sm:hidden ${showFilter ? "rotate-180" : ""}`}
            src={assets.dropdown_icon}
            alt=""
          />
        </p>

        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 mx-auto max-w-xs ${
            showFilter ? "" : "hidden"
          } md:block`}
        >
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {["Men", "Women", "Kids"].map((c) => (
              <label className="flex gap-2" key={c}>
                <input
                  className="w-3"
                  type="checkbox"
                  value={c}
                  onChange={Toggle}
                  checked={selectedCategories.includes(c)}
                />
                {c}
              </label>
            ))}
          </div>
        </div>

        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 mx-auto max-w-xs ${
            showFilter ? "" : "hidden"
          } md:block`}
        >
          <p className="mb-3 text-sm font-medium">TYPES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {["Topwear", "Bottomwear", "Winterwear"].map((s) => (
              <label className="flex gap-2" key={s}>
                <input
                  className="w-3"
                  type="checkbox"
                  value={s}
                  onChange={ToggleSubCategory}
                  checked={selectedSubCategories.includes(s)}
                />
                {s}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1">
        <div className="flex justify-center text-base sm:text-2xl mb-4 mt-7">
          <Title text1={"ALL"} text2={"COLLECTIONS"} />
        </div>

        {/* Sort */}
        <div className="flex justify-center mb-15 md:justify-start md:ml-8">
          <select
            className="border-2 border-gray-300 text-sm px-2 md:pl-5"
            value={sortBy}
            onChange={sortProducts}
          >
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6 mx-5 md:mx-7 my-5 md:my-10">
          {filterProducts.map((item) => (
            <ProductItem
              key={item.id}
              id={item.id} // ← use DynamoDB id
              name={item.name}
              price={item.price}
              image={item.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
