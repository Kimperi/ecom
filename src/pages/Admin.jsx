import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';
import { createProduct, updateProduct, deleteProduct } from '../lib/productsApi';
import { isDemo } from '../config';

const emptyForm = {
  id: '',
  name: '',
  description: '',
  price: '',
  category: 'Women',
  subCategory: 'Topwear',
  sizes: 'S,M,L',
  image: '',
  bestseller: false,
};
export default function Admin() {
  const { products, refreshProducts } = useContext(ShopContext);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [filter, setFilter] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (e) =>
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));
  const reset = () => {
    setForm(emptyForm);
    setEditingId('');
  };
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const data = {
        ...form,
        id: form.id.trim(),
        price: Number(form.price),
        sizes: form.sizes
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        image: form.image
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        date: Date.now(),
      };
      if (editingId) await updateProduct(editingId, data);
      else await createProduct(data);
      await refreshProducts();
      reset();
      toast.success(editingId ? 'Product updated.' : 'Product created.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }
  function edit(product) {
    setForm({
      ...product,
      sizes: product.sizes.join(','),
      image: (Array.isArray(product.image) ? product.image : [product.image]).join('\n'),
    });
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function remove(id) {
    if (!window.confirm('Delete this product?')) return;
    setBusy(true);
    try {
      await deleteProduct(id);
      await refreshProducts();
      if (editingId === id) reset();
      toast.success('Product deleted.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }
  const shown = products.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()));
  const field = 'block w-full border border-slate-300 rounded-lg p-3 mt-2';
  return (
    <main className="bg-slate-50 px-5 py-10">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm uppercase tracking-widest text-slate-500">Catalog management</p>
        <h1 className="text-4xl prata-regular mt-3 mb-3">Admin workspace</h1>
        {isDemo && (
          <p className="text-slate-600 mb-8">
            Local sandbox. Changes are visible throughout this demo and reset when the page reloads.
          </p>
        )}
        <form onSubmit={submit} className="bg-white border rounded-xl p-6 md:p-8 space-y-5">
          <h2 className="text-xl font-semibold">{editingId ? 'Edit product' : 'Add a product'}</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <label>
              Product ID
              <input
                name="id"
                value={form.id}
                onChange={change}
                required
                maxLength={100}
                disabled={!!editingId}
                className={field}
              />
            </label>
            <label>
              Product name
              <input
                name="name"
                value={form.name}
                onChange={change}
                required
                maxLength={120}
                className={field}
              />
            </label>
          </div>
          <label className="block">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={change}
              maxLength={2000}
              rows={3}
              className={field}
            />
          </label>
          <div className="grid sm:grid-cols-3 gap-5">
            <label>
              Price (MAD)
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={change}
                min="0.01"
                step="0.01"
                required
                className={field}
              />
            </label>
            <label>
              Category
              <select name="category" value={form.category} onChange={change} className={field}>
                {['Women', 'Men', 'Kids'].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              Subcategory
              <select
                name="subCategory"
                value={form.subCategory}
                onChange={change}
                className={field}
              >
                {['Topwear', 'Bottomwear', 'Winterwear'].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            Sizes (comma-separated)
            <input name="sizes" value={form.sizes} onChange={change} required className={field} />
          </label>
          <label className="block">
            Image paths (one per line)
            <textarea
              name="image"
              value={form.image}
              onChange={change}
              required
              rows={2}
              placeholder="Copy an image path from an existing product"
              className={field}
            />
          </label>
          {isDemo && products.length > 0 && (
            <button
              type="button"
              onClick={() => setForm((value) => ({ ...value, image: products[0].image[0] }))}
              className="text-sm underline text-slate-700"
            >
              Use a sample image
            </button>
          )}
          <p className="text-xs text-slate-500">
            Use a local image from an existing product to keep the demo offline. HTTPS images
            contact the selected image host.
          </p>
          <label className="flex gap-3 items-center">
            <input type="checkbox" name="bestseller" checked={form.bestseller} onChange={change} />
            Feature as a bestseller
          </label>
          <div className="flex gap-4">
            <button
              disabled={busy}
              className="bg-slate-900 text-white px-6 py-3 rounded-lg disabled:opacity-50"
            >
              {busy ? 'Saving…' : editingId ? 'Update product' : 'Create product'}
            </button>
            {editingId && (
              <button type="button" onClick={reset} className="border rounded-lg px-6 py-3">
                Cancel edit
              </button>
            )}
          </div>
        </form>
        <section className="bg-white border rounded-xl p-6 md:p-8 mt-8">
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Products ({shown.length})</h2>
            <input
              aria-label="Search products"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search products"
              className="border rounded-lg px-4 py-2"
            />
          </div>
          <div className="divide-y">
            {shown.map((product) => (
              <article key={product.id} className="flex flex-wrap items-center gap-4 py-4">
                <img src={product.image[0]} alt="" className="w-14 h-18 rounded object-cover" />
                <div className="flex-1 min-w-40">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-slate-500">
                    {product.id} · {Number(product.price).toFixed(2)} MAD
                  </p>
                </div>
                <button
                  disabled={busy}
                  onClick={() => edit(product)}
                  aria-label={`Edit ${product.name}`}
                  className="border rounded px-4 py-2"
                >
                  Edit
                </button>
                <button
                  disabled={busy}
                  onClick={() => remove(product.id)}
                  aria-label={`Delete ${product.name}`}
                  className="text-red-700 border rounded px-4 py-2"
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
          {!shown.length && <p className="text-slate-500 py-6">No matching products.</p>}
        </section>
      </div>
    </main>
  );
}
