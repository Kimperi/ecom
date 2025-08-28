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
    return new Array(5)
      .fill(0)
      .map((_, i) => (
        <img
          key={i}
          src={i < full ? assets.star_icon : assets.star_dull_icon}
          alt={i < full ? "Filled star" : "Empty star"}
          className="w-4 h-4"
        />
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
    <div className="mx-4 md:mx-10">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500 py-3">
        <ol className="flex gap-2 flex-wrap">
          <li>
            <Link to="/" className="hover:text-gray-800">
              Home
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-800 line-clamp-1" aria-current="page">
            {productData.name}
          </li>
        </ol>
      </nav>

      {/* Product layout grid */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left — gallery */}
        <section className="lg:order-1">
          <div className="rounded-2xl overflow-hidden bg-gray-50 border">
            <img
              src={image}
              alt={productData.name}
              className="w-full h-[360px] md:h-[540px] object-cover"
            />
          </div>

          <div className="mt-3">
            <div className="hidden sm:grid grid-cols-5 gap-3">
              {(productData.image || []).map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImage(src)}
                  className={`rounded-xl overflow-hidden border focus:outline-none focus:ring-2 focus:ring-black ${
                    image === src ? "ring-2 ring-black" : ""
                  }`}
                >
                  <img
                    src={src}
                    alt="Thumbnail"
                    className="w-full h-24 object-cover"
                  />
                </button>
              ))}
            </div>
            <div className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1">
              {(productData.image || []).map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImage(src)}
                  className={`snap-start min-w-[28%] rounded-xl overflow-hidden border ${
                    image === src ? "ring-2 ring-black" : ""
                  }`}
                >
                  <img
                    src={src}
                    alt="Thumbnail"
                    className="w-full h-24 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Right — details */}
        <aside className="lg:order-2 lg:sticky lg:top-24 self-start space-y-5">
          <h1 className="font-semibold text-2xl md:text-3xl tracking-tight text-gray-900">
            {productData.name}
          </h1>

          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              {renderStars(avgRating)}
            </div>
            <span className="text-gray-600">
              {avgRating
                ? `${avgRating} • ${reviews.length} review${
                    reviews.length !== 1 ? "s" : ""
                  }`
                : "No reviews yet"}
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-semibold text-gray-900">
              {productData.price} {currency}
            </p>
            {productData.compareAtPrice && (
              <p className="text-gray-400 line-through">
                {productData.compareAtPrice} {currency}
              </p>
            )}
          </div>

          {productData.description && (
            <p className="text-gray-600 leading-relaxed">
              {productData.description}
            </p>
          )}

          {hasSizes && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Select size</label>
              <div className="flex flex-wrap gap-2">
                {productData.sizes.map((it, i) => (
                  <button
                    key={i}
                    onClick={() => setSize(it)}
                    className={`px-4 py-2 rounded-xl border text-sm transition ${
                      size === it
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {it}
                  </button>
                ))}
              </div>
              {disabledAdd && (
                <p className="text-xs text-red-600">Please choose a size.</p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => addToCart(productData.id, size)}
              disabled={disabledAdd}
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-black text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
            >
              <span>Add to cart</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Reviews */}
      <div className="grid lg:grid-cols-5 gap-8 mt-12">
        <section className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">
              Reviews ({reviews.length})
            </h3>
            {avgRating > 0 && (
              <span className="text-sm text-gray-600">
                Average: {avgRating}/5
              </span>
            )}
          </div>

          {isLoggedIn ? (
            <form
              onSubmit={submitReview}
              className="border rounded-2xl p-4 space-y-3"
            >
              <h4 className="font-medium">Write a review</h4>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  className="border px-3 py-2 rounded-xl bg-gray-50 flex-1"
                  value={form.name}
                  readOnly
                />
                <select
                  className="border px-3 py-2 rounded-xl w-36"
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
                className="border px-3 py-2 rounded-xl min-h-24 w-full"
                placeholder="Share details about quality, fit, etc."
                value={form.comment}
                onChange={(e) =>
                  setForm((f) => ({ ...f, comment: e.target.value }))
                }
              />
              <button
                type="submit"
                disabled={posting}
                className="inline-flex bg-black text-white px-5 py-2 rounded-xl text-sm disabled:opacity-60"
              >
                {posting ? "Submitting..." : "Submit review"}
              </button>
            </form>
          ) : (
            <div className="border rounded-2xl p-4 bg-amber-50 border-amber-200">
              <p className="text-sm text-amber-900">
                Please log in to write a review.
              </p>
            </div>
          )}

          <div className="border rounded-2xl p-4 mt-4">
            <h4 className="font-medium mb-2">Customer reviews</h4>
            {loadingReviews ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-gray-500">
                No reviews yet. Be the first!
              </p>
            ) : (
              <ul className="flex flex-col divide-y">
                {reviews.map((r) => (
                  <li key={r.reviewId} className="py-3">
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
        </section>
      </div>

      <div className="mt-14">
        <RelatedProduct
          category={productData.category}
          subCategory={productData.subCategory}
        />
      </div>
    </div>
  );
}
