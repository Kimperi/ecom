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

      {/* rest of component remains the same */}
      {/* ... */}

      <div className="mt-14">
        <RelatedProduct
          category={productData.category}
          subCategory={productData.subCategory}
        />
      </div>
    </div>
  );
}
