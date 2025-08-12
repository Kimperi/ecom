import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

const Collection = () => {
  const { products, search, showsearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
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
  const [subCategories, setSubCategories] = useState([]);
  const [sortBy, setSortBy] = useState("relevant");

  const Toggle = (e) => {
    if (selectedCategories.includes(e.target.value)) {
      setSelectedCategories((prev) =>
        prev.filter((item) => item !== e.target.value)
      );
    } else {
      setSelectedCategories((prev) => [...prev, e.target.value]);
    }
  };

  const ToggleSubCategory = (e) => {
    if (selectedSubCategories.includes(e.target.value)) {
      setSelectedSubCategories((prev) =>
        prev.filter((item) => item !== e.target.value)
      );
    } else {
      setSelectedSubCategories((prev) => [...prev, e.target.value]);
    }
  };

  const sortProducts = (e) => {
    const sortValue = e.target.value;
    setSortBy(sortValue);
    console.log(sortValue);
  };

  useEffect(() => {
    // Get unique categories and subcategories
    const uniqueCategories = [
      ...new Set(products.map((item) => item.category)),
    ];
    const uniqueSubCategories = [
      ...new Set(products.map((item) => item.subCategory)),
    ];
    setSubCategories(uniqueSubCategories);
  }, [products]);

  useEffect(() => {
    // First apply filters
    let filtered = products;

    console.log("Products available:", products.length);
    console.log("Selected categories:", selectedCategories);
    console.log("Selected subcategories:", selectedSubCategories);
    console.log("Sort by:", sortBy);
    console.log("Search term:", search);
    console.log("Show search:", showsearch);

    // Filter by search term if search is active and has content
    if (showsearch && search) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by categories if any selected
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(product.category)
      );
    }

    // Filter by subcategories if any selected
    if (selectedSubCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedSubCategories.includes(product.subCategory)
      );
    }

    // Then apply sorting
    if (sortBy === "low-high") {
      filtered = filtered.sort((a, b) => a.price - b.price);
      console.log("Applied low-high sorting");
    } else if (sortBy === "high-low") {
      filtered = filtered.sort((a, b) => b.price - a.price);
      console.log("Applied high-low sorting");
    }
    // "relevant" keeps the original order

    setFilterProducts(filtered);
    console.log("Final filtered products:", filtered.length);
  }, [
    selectedCategories,
    selectedSubCategories,
    sortBy,
    products,
    search,
    showsearch,
  ]);

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
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
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Men"}
                onChange={Toggle}
                checked={selectedCategories.includes("Men")}
              />
              Men
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Women"}
                onChange={Toggle}
                checked={selectedCategories.includes("Women")}
              />
              Women
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Kids"}
                onChange={Toggle}
                checked={selectedCategories.includes("Kids")}
              />
              Kids
            </p>
          </div>
        </div>
        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 mx-auto max-w-xs ${
            showFilter ? "" : "hidden"
          } md:block`}
        >
          <p className="mb-3 text-sm font-medium">TYPES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Topwear"}
                onChange={ToggleSubCategory}
                checked={selectedSubCategories.includes("Topwear")}
              />
              Topwear
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Bottomwear"}
                onChange={ToggleSubCategory}
                checked={selectedSubCategories.includes("Bottomwear")}
              />
              Bottomwear
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Winterwear"}
                onChange={ToggleSubCategory}
                checked={selectedSubCategories.includes("Winterwear")}
              />
              Winterwear
            </p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1">
        <div className="flex justify-center text-base sm:text-2xl mb-4 mt-7">
          <Title text1={"ALL"} text2={"COLLECTIONS"} />
        </div>

        {/* Product Sort */}
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
        {/* Map Products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6 mx-5 md:mx-7 my-5 md:my-10">
          {filterProducts.map((item, index) => (
            <ProductItem
              key={index}
              name={item.name}
              id={item._id}
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
