import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { useSession } from '../auth/useSession';
import { listReviews, createReview } from '../lib/reviewsApi';
import RelatedProduct from '../components/RelatedProduct';
import { assets } from '../assets/assets';
import { isDemo } from '../config';

export default function Product() {
  const { productId } = useParams();
  const { products, addToCart, currency } = useContext(ShopContext);
  const { user } = useSession();
  const product = products.find((item) => String(item.id) === productId);
  const [selection, setSelection] = useState({ productId, image: '', size: '' });
  const current = selection.productId === productId ? selection : { image: '', size: '' };
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [reviewVersion, setReviewVersion] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    listReviews(productId)
      .then((data) => {
        if (active) setReviews(data);
      })
      .catch(() => {
        if (active) {
          setReviews([]);
          setError('Reviews are unavailable. Please try again.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId, reviewVersion]);

  async function submitReview(event) {
    event.preventDefault();
    setPosting(true);
    setError('');
    try {
      await createReview(productId, { ...form, name: user?.name });
      setForm({ rating: 5, comment: '' });
      setReviewVersion((v) => v + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  }
  if (!product)
    return (
      <section className="p-16 text-center">
        <h1 className="text-2xl">Product not found</h1>
        <Link to="/collection" className="underline">
          Back to the collection
        </Link>
      </section>
    );
  const images = Array.isArray(product.image) ? product.image : [product.image];
  const average = reviews.length
    ? (reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length).toFixed(1)
    : null;
  return (
    <main className="max-w-6xl mx-auto px-5 py-10">
      <Link to="/collection" className="text-sm text-slate-500 underline">
        Back to collection
      </Link>
      <div className="grid md:grid-cols-2 gap-10 mt-8">
        <div>
          <img
            src={current.image || images[0] || assets.logo}
            alt={product.name}
            className="w-full max-h-[580px] object-contain bg-slate-50 rounded-xl"
          />
          <div className="flex gap-3 mt-4">
            {[...new Set(images)].map((image, index) => (
              <button
                key={image}
                onClick={() => setSelection({ ...current, productId, image })}
                aria-label={`View image ${index + 1}`}
              >
                <img src={image} alt="" className="h-20 w-16 object-cover rounded border" />
              </button>
            ))}
          </div>
        </div>
        <div className="py-4">
          <p className="text-sm text-slate-500 uppercase tracking-widest">
            {product.category} / {product.subCategory}
          </p>
          <h1 className="text-3xl md:text-4xl prata-regular mt-4 leading-tight">{product.name}</h1>
          <p className="text-2xl font-semibold mt-6">
            {Number(product.price).toFixed(2)} {currency}
          </p>
          <p className="text-sm text-slate-500 mt-3">
            {average ? `${average} / 5 · ${reviews.length} review(s)` : 'No reviews yet'}
          </p>
          <p className="text-slate-600 leading-relaxed mt-7">{product.description}</p>
          <fieldset className="mt-8">
            <legend className="font-semibold mb-3">Select size</legend>
            <div className="flex gap-3 flex-wrap">
              {(product.sizes || []).map((size) => (
                <button
                  type="button"
                  key={size}
                  aria-pressed={current.size === size}
                  onClick={() => setSelection({ ...current, productId, size })}
                  className={`min-w-12 rounded border p-3 ${current.size === size ? 'bg-slate-900 text-white' : 'bg-white'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </fieldset>
          <button
            disabled={!current.size}
            onClick={() => addToCart(product.id, current.size)}
            className="mt-8 bg-slate-900 text-white py-4 px-10 rounded disabled:opacity-40"
          >
            Add to cart
          </button>
          <p className="text-xs text-slate-500 mt-5">
            {isDemo
              ? 'Sample catalog · no items are sold through this demonstration.'
              : 'Cash on delivery. Availability is confirmed by the seller.'}
          </p>
        </div>
      </div>
      <section className="mt-14 border-t pt-8">
        <h2 className="text-2xl prata-regular mb-6">Customer reviews</h2>
        {error && (
          <p role="alert" className="text-red-700 mb-4">
            {error}
          </p>
        )}
        {loading ? (
          <p role="status">Loading reviews…</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <article key={review.reviewId} className="border rounded-xl p-5">
                <p className="font-semibold">
                  {review.name} · {review.rating}/5
                </p>
                <p className="mt-2 text-slate-600 break-words">{review.comment}</p>
              </article>
            ))}
          </div>
        )}
        {user ? (
          <form onSubmit={submitReview} className="mt-8 max-w-xl space-y-4">
            <label className="block">
              Rating
              <select
                aria-label="Rating"
                className="ml-4 border rounded p-2"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating}>{rating}</option>
                ))}
              </select>
            </label>
            <label className="block">
              Your review
              <textarea
                className="block border rounded w-full mt-2 p-3"
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                maxLength={1000}
                required
                rows={3}
              />
            </label>
            <button
              disabled={posting}
              className="bg-slate-900 text-white rounded px-5 py-3 disabled:opacity-50"
            >
              {posting ? 'Posting…' : 'Post review'}
            </button>
          </form>
        ) : (
          <Link
            to="/login"
            state={{ from: `/product/${encodeURIComponent(productId)}` }}
            className="inline-block underline mt-6"
          >
            {isDemo ? 'Choose a demo profile to write a review' : 'Log in to write a review'}
          </Link>
        )}
      </section>
      <RelatedProduct
        category={product.category}
        subCategory={product.subCategory}
        productId={product.id}
      />
    </main>
  );
}
