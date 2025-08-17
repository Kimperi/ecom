// src/pages/Product.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProduct from "../components/RelatedProduct";
import { fetchAuthSession } from "@aws-amplify/auth";

const REVIEWS_API =
  "https://87nhgr1ouh.execute-api.us-east-1.amazonaws.com/reviews";

export default function Product() {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "Anonymous",
    rating: 5,
    comment: "",
  });

  // ----- helpers -----
  const renderStars = (value) => {
    const full = Math.floor(value);
    return new Array(5)
      .fill(0)
      .map((_, i) => (
        <img
          key={i}
          src={i < full ? assets.star_icon : assets.star_dull_icon}
          alt=""
          className="w-3.5"
        />
      ));
  };

  const getUserNameFromCognito = async () => {
    try {
      const session = await fetchAuthSession();
      const payload = session.tokens?.idToken?.payload || {};
      return payload.name || payload.given_name || payload.email || "Anonymous";
    } catch {
      return "Anonymous";
    }
  };

  const getAuthHeaderIfAny = async () => {
    try {
      const session = await fetchAuthSession();
      const jwt = session.tokens?.idToken?.toString();
      return jwt ? { Authorization: `Bearer ${jwt}` } : {};
    } catch {
      return {};
    }
  };

  // ----- data loaders -----
  const fetchProductData = () => {
    for (const item of products) {
      if (item._id === productId) {
        setProductData(item);
        setImage(item.image?.[0] || "");
        break;
      }
    }
  };

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const url = `${REVIEWS_API}?productId=${encodeURIComponent(productId)}`;
      const res = await fetch(url, { method: "GET" });
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReviews(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.rating || form.rating < 1 || form.rating > 5) {
      return setError("Please select a rating between 1 and 5.");
    }
    if (!form.comment.trim()) {
      return setError("Please write a short comment.");
    }

    try {
      setPosting(true);
      const url = `${REVIEWS_API}?productId=${encodeURIComponent(productId)}`;
      const auth = await getAuthHeaderIfAny();

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({
          name: form.name || "Anonymous",
          rating: Number(form.rating),
          comment: form.comment.trim(),
        }),
      });

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {}
        if (res.status === 401) msg = "Please log in to write a review.";
        if (res.status === 409) msg = "You already reviewed this product.";
        throw new Error(msg);
      }

      const created = await res.json();
      setReviews((r) => [created, ...r]);
      setForm((f) => ({ ...f, comment: "", rating: 5 }));
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not submit review. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  // ----- derived -----
  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((s, r) => s + Number(r.rating || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  // ----- effects -----
  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  useEffect(() => {
    if (productId) loadReviews();
  }, [productId]);

  useEffect(() => {
    fetchAuthSession()
      .then((s) => setIsLoggedIn(!!s.tokens?.idToken))
      .catch(() => setIsLoggedIn(false));
    getUserNameFromCognito().then((name) => setForm((f) => ({ ...f, name })));
  }, []);

  // ----- render -----
  if (!productData) return <div className="opacity-0"></div>;

  return (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100 mx-10">
      {/* --- Product Details --- */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* Product Images (unchanged) */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-hidden justify-between sm:justify-normal sm:w-[18,7%] h-full">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                key={index}
                src={item}
                alt=""
                className="w-[24%] md:w-full md:h-[11%] flex-shrink-0 cursor-pointer object-cover mb-3 ml-5"
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%] h-[44%]">
            <img src={image} alt="" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>

          <div className="flex items-center gap-1 mt-2">
            {renderStars(avgRating)}
            <p className="pl-2 text-sm">
              {avgRating
                ? `${avgRating} · ${reviews.length} review${
                    reviews.length !== 1 ? "s" : ""
                  }`
                : "No reviews yet"}
            </p>
          </div>

          <p className="mt-5 text-3xl font-medium">
            {productData.price} {currency}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>

          {/* Select Size */}
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  key={index}
                  className={`border py-2 px-4 bg-gray-100 ${
                    size === item ? "bg-orange-500 " : ""
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={() => addToCart(productData._id, size)}
            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
          >
            ADD TO CART
          </button>

          <hr className="mt-8 sm:w-4/5 border-gray-300" />

          {/* Policies */}
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* --- Description + Reviews --- */}
      <div className="md:absolute md:top-210 grid grid-cols-1 md:grid-cols-2 gap-8 mx-5 mt-10 mb-10">
        {/* Description */}
        <div>
          <h3 className="font-semibold border-b pb-2 mb-3">Description</h3>
          <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
            <p>{productData.description}</p>
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h3 className="font-semibold border-b pb-2 mb-3">
            Reviews ({reviews.length})
          </h3>

          {/* Review form */}
          {isLoggedIn ? (
            <form
              onSubmit={submitReview}
              className="border p-4 rounded-md flex flex-col gap-3"
            >
              <h4 className="font-semibold">Write a review</h4>
              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-3 items-center">
                <input
                  className="border px-3 py-2 w-1/2 bg-gray-100"
                  value={form.name}
                  readOnly
                />
                <select
                  className="border px-3 py-2"
                  value={form.rating}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rating: Number(e.target.value) }))
                  }
                >
                  {[5, 4, 3, 2, 1].map((v) => (
                    <option key={v} value={v}>
                      {v} star{v > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                className="border px-3 py-2 min-h-24"
                placeholder="Share details about quality, fit, etc."
                value={form.comment}
                onChange={(e) =>
                  setForm((f) => ({ ...f, comment: e.target.value }))
                }
              />

              <button
                type="submit"
                disabled={posting}
                className="self-start bg-black text-white px-5 py-2 text-sm disabled:opacity-60"
              >
                {posting ? "Submitting..." : "Submit review"}
              </button>
            </form>
          ) : (
            <div className="border p-4 rounded-md">
              <p className="text-sm text-red-600">
                Please log in to write a review.
              </p>
            </div>
          )}

          {/* Reviews list */}
          <div className="border mt-4 p-4 rounded-md">
            <h4 className="font-semibold mb-2">Customer reviews</h4>
            {loadingReviews ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-gray-500">
                No reviews yet. Be the first!
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {reviews.map((r) => (
                  <li key={r.reviewId} className="border-b pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(r.rating)}</div>
                      <span className="text-sm text-gray-600">
                        {r.name || "Anonymous"} ·{" "}
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {r.comment && <p className="text-sm mt-1">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <RelatedProduct
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  );
}
