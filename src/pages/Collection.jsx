import React, { useContext, useState, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import LoadingSpinner from "../components/LoadingSpinner";

const Collection = () => {
  const { products, loadingProducts } = useContext(ShopContext);

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

  if (loadingProducts) {
    return (
      <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
        {/* Left filters */}
        <div className="min-w-60 md:ml-4 ml-2">
          <p className="text-xl flex items-center cursor-pointer gap-2 my-5 ml-6">
            FILTERS
            <img className="h-3 sm:hidden" src={assets.dropdown_icon} alt="" />
          </p>
        </div>

        {/* Right side with loading */}
        <div className="flex-1">
          <div className="flex justify-center text-base sm:text-2xl mb-4 mt-7">
            <Title text1={"ALL"} text2={"COLLECTIONS"} />
          </div>
          <LoadingSpinner text="Loading products..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
      {/* Left filters */}
      <div className="min-w-60 md:ml-4 ml-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Filter Header */}
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <button
              className="md:hidden ml-auto p-1 hover:bg-gray-100 rounded transition-colors"
              onClick={() => setShowFilter(!showFilter)}
            >
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  showFilter ? "rotate-180" : ""
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Filter Content */}
          <div className={`${showFilter ? "" : "hidden"} md:block space-y-6`}>
            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Categories
              </h3>
              <div className="space-y-2">
                {["Men", "Women", "Kids"].map((c) => (
                  <label
                    key={c}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={c}
                      onChange={Toggle}
                      checked={selectedCategories.includes(c)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{c}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Types */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Types</h3>
              <div className="space-y-2">
                {["Topwear", "Bottomwear", "Winterwear"].map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={s}
                      onChange={ToggleSubCategory}
                      checked={selectedSubCategories.includes(s)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Showing {filterProducts.length} products
              </p>
            </div>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-8 mx-5 md:mx-7 my-5 md:my-10">
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
