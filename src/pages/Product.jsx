import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
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

  // ---------- helpers ----------
  const renderStars = (value) => {
    const full = Math.floor(value);
    return new Array(5).fill(0).map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${
          i < full ? "text-yellow-400" : "text-gray-300"
        } fill-current`}
        viewBox="0 0 20 20"
      >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    ));
  };

  const getUserNameFromCognito = async () => {
    try {
      const session = await fetchAuthSession();
      const p = session.tokens?.idToken?.payload || {};
      return p.name || p.given_name || p.email || "Anonymous";
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

  // ---------- data loaders ----------
  useEffect(() => {
    const found = products.find((p) => String(p.id) === String(productId)); // DynamoDB id
    if (found) {
      setProductData(found);
      const first = Array.isArray(found.image) ? found.image[0] : found.image;
      setImage(first);
      // scroll to top when product changes
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [productId, products]);

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

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((s, r) => s + Number(r.rating || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  useEffect(() => {
    if (productId) loadReviews();
  }, [productId]);

  useEffect(() => {
    fetchAuthSession()
      .then((s) => setIsLoggedIn(!!s.tokens?.idToken))
      .catch(() => setIsLoggedIn(false));
    getUserNameFromCognito().then((name) => setForm((f) => ({ ...f, name })));
  }, []);

  // ---------- UI ----------
  if (!productData)
    return (
      <div className="mx-4 md:mx-10 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="h-80 md:h-[520px] bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-gray-200 rounded" />
            <div className="h-6 w-1/3 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-12 w-40 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );

  const hasSizes =
    Array.isArray(productData.sizes) && productData.sizes.length > 0;
  const disabledAdd = hasSizes && !size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="mx-4 md:mx-10 lg:mx-20">
        {/* Enhanced Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="py-6">
          <ol className="flex items-center gap-3 text-sm">
            <li>
              <Link
                to="/"
                className="text-gray-500 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li
              className="text-gray-800 font-semibold line-clamp-1"
              aria-current="page"
            >
              {productData.name}
            </li>
          </ol>
        </nav>

        {/* Main Product Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-16">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left — Enhanced Gallery */}
            <section className="lg:order-1 bg-gradient-to-br from-gray-50 to-gray-100 p-8">
              <div className="relative">
                {/* Main Image */}
                <div className="rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-200">
                  <img
                    src={image}
                    alt={productData.name}
                    className="w-full h-[400px] md:h-[600px] object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>

              {/* Thumbnail Gallery */}
              <div className="mt-6">
                <div className="hidden sm:grid grid-cols-5 gap-3">
                  {(productData.image || []).map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setImage(src)}
                      className={`rounded-xl overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                        image === src
                          ? "border-gray-800 ring-2 ring-gray-200 shadow-lg"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                      }`}
                    >
                      <img
                        src={src}
                        alt="Thumbnail"
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
                <div className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2">
                  {(productData.image || []).map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setImage(src)}
                      className={`snap-start min-w-[28%] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        image === src
                          ? "border-gray-800 ring-2 ring-gray-200 shadow-lg"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={src}
                        alt="Thumbnail"
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Right — Enhanced Details */}
            <aside className="lg:order-2 p-8 lg:p-12 space-y-8">
              {/* Product Header */}
              <div className="space-y-4">
                <h1 className="font-bold text-3xl md:text-4xl tracking-tight text-gray-900 leading-tight">
                  {productData.name}
                </h1>

                {/* Enhanced Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {renderStars(avgRating)}
                  </div>
                  <span className="text-gray-600 font-medium">
                    {avgRating
                      ? `${avgRating} • ${reviews.length} review${
                          reviews.length !== 1 ? "s" : ""
                        }`
                      : "No reviews yet"}
                  </span>
                </div>

                {/* Enhanced Price */}
                <div className="flex items-baseline gap-4">
                  <p className="text-4xl font-bold text-gray-900">
                    {productData.price} {currency}
                  </p>
                  {productData.compareAtPrice && (
                    <p className="text-xl text-gray-400 line-through">
                      {productData.compareAtPrice} {currency}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              {productData.description && (
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base">
                    {productData.description}
                  </p>
                </div>
              )}

              {/* Size Selection */}
              {hasSizes && (
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-gray-900">
                    Select Size
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {productData.sizes.map((it, i) => (
                      <button
                        key={i}
                        onClick={() => setSize(it)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                          size === it
                            ? "bg-gray-800 text-white border-gray-800 shadow-lg transform scale-105"
                            : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        {it}
                      </button>
                    ))}
                  </div>
                  {disabledAdd && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">
                        Please choose a size to continue
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Add to Cart Section */}
              <div className="space-y-4">
                <button
                  onClick={() => addToCart(productData.id, size)}
                  disabled={disabledAdd}
                  className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white px-6 py-3 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                      />
                    </svg>
                    Add to Cart
                  </span>
                </button>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Free Shipping
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Easy Returns
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Enhanced Reviews Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-16">
          <div className="grid lg:grid-cols-5 gap-8">
            <section className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-2xl text-gray-900">
                  Customer Reviews ({reviews.length})
                </h3>
                {avgRating > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">
                      Average:
                    </span>
                    <div className="flex items-center gap-1">
                      {renderStars(avgRating)}
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {avgRating}/5
                    </span>
                  </div>
                )}
              </div>

              {/* Review Form */}
              {isLoggedIn ? (
                <form
                  onSubmit={submitReview}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6 space-y-4 mb-8"
                >
                  <h4 className="font-semibold text-lg text-gray-900">
                    Write a Review
                  </h4>
                  {error && (
                    <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      className="border border-gray-300 px-4 py-3 rounded-xl bg-white focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                      value={form.name}
                      readOnly
                    />
                    <select
                      className="border border-gray-300 px-4 py-3 rounded-xl bg-white focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                      value={form.rating}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          rating: Number(e.target.value),
                        }))
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
                    className="border border-gray-300 px-4 py-3 rounded-xl min-h-28 w-full bg-white focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Share your experience with this product..."
                    value={form.comment}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, comment: e.target.value }))
                    }
                  />
                  <button
                    type="submit"
                    disabled={posting}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {posting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              ) : (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 mb-8">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-6 h-6 text-amber-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-amber-900 font-medium">
                      Please log in to write a review and share your experience.
                    </p>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {loadingReviews ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading reviews...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl">
                    <svg
                      className="w-12 h-12 text-gray-400 mx-auto mb-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-gray-500 font-medium">
                      No reviews yet. Be the first to share your experience!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div
                        key={r.reviewId}
                        className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="flex">{renderStars(r.rating)}</div>
                            <span className="text-sm text-gray-600 font-medium">
                              {r.name || "Anonymous"}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {r.comment && (
                          <p className="text-gray-700 leading-relaxed">
                            {r.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Related Products */}
        <div className="mb-16">
          <RelatedProduct
            category={productData.category}
            subCategory={productData.subCategory}
          />
        </div>
      </div>
    </div>
  );
}
