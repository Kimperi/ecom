import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';

export default function Cart() {
  const { cartItems, setCartItems, products, currency, updateQuantity, navigate } =
    useContext(ShopContext);
  const rows = Object.entries(cartItems).flatMap(([id, sizes]) =>
    Object.entries(sizes).map(([size, quantity]) => ({
      id,
      size,
      quantity,
      product: products.find((product) => String(product.id) === id),
    })),
  );
  function remove(id, size) {
    setCartItems((previous) => {
      const next = structuredClone(previous);
      delete next[id][size];
      if (!Object.keys(next[id]).length) delete next[id];
      return next;
    });
  }
  return (
    <main className="max-w-6xl mx-auto px-5 py-12 min-h-[50vh]">
      <h1 className="text-3xl prata-regular mb-8">Your cart</h1>
      {!rows.length ? (
        <div className="py-12 text-center text-slate-600">
          <p>Your cart is empty.</p>
          <Link to="/collection" className="inline-block underline mt-4">
            Explore the collection
          </Link>
        </div>
      ) : (
        <>
          <div className="divide-y border-y">
            {rows.map(({ id, size, quantity, product }) => (
              <article key={`${id}-${size}`} className="flex flex-wrap items-center gap-4 py-6">
                <img
                  src={product?.image?.[0] || assets.logo}
                  alt=""
                  className="w-16 h-20 object-cover rounded"
                />
                <div className="flex-1 min-w-36">
                  <h2 className="font-semibold">{product?.name || 'Unavailable product'}</h2>
                  <p className="text-sm text-slate-500 mt-2">
                    Size: {size}
                    {product
                      ? ` · ${Number(product.price).toFixed(2)} ${currency}`
                      : ' · Remove this item to continue.'}
                  </p>
                </div>
                <label className="text-sm">
                  Quantity
                  <input
                    aria-label={`Quantity for ${product?.name || id}, size ${size}`}
                    type="number"
                    min={1}
                    max={99}
                    step={1}
                    value={quantity}
                    onChange={(e) => updateQuantity(id, size, e.target.value)}
                    className="block border rounded w-20 p-2 mt-1"
                  />
                </label>
                <button
                  onClick={() => remove(id, size)}
                  aria-label={`Remove ${product?.name || id}, size ${size}`}
                  className="underline text-sm text-red-700 px-2 py-3"
                >
                  Remove
                </button>
              </article>
            ))}
          </div>
          <div className="max-w-md ml-auto mt-8">
            <CartTotal />
            <button
              onClick={() => navigate('/place-order')}
              disabled={rows.some((row) => !row.product)}
              className="bg-slate-900 text-white rounded-lg px-6 py-4 mt-5 w-full disabled:opacity-40"
            >
              Proceed to checkout
            </button>
          </div>
        </>
      )}
    </main>
  );
}
