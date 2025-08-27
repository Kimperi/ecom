import React, { useEffect, useState } from "react";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
} from "../lib/productsApi";

const DEFAULT = {
  id: "",
  name: "",
  description: "",
  price: 0,
  image: [],
  category: "Women",
  subCategory: "Topwear",
  sizes: ["S", "M", "L"],
  date: Date.now(),
  bestseller: false,
};

export default function Admin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");
  const [editingId, setEditingId] = useState("");

  // load all products on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await listProducts();
        setItems(data);
      } catch (err) {
        console.error("Error loading products:", err);
      }
    })();
  }, []);

  const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateProduct(editingId, { ...form, id: undefined });
      } else {
        await createProduct({ ...form, date: Date.now() });
      }
      const fresh = await listProducts();
      setItems(fresh);
      setForm(DEFAULT);
      setEditingId("");
      alert("Product saved!");
    } catch (e) {
      alert(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onEdit(id) {
    try {
      const p = await getProduct(id);
      if (!p) return;
      setForm({
        id: p.id,
        name: p.name || "",
        description: p.description || "",
        price: Number(p.price) || 0,
        image: p.image || [],
        category: p.category || "",
        subCategory: p.subCategory || "",
        sizes: p.sizes || ["S", "M", "L"],
        date: p.date || Date.now(),
        bestseller: !!p.bestseller,
      });
      setEditingId(id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error loading product:", err);
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      setItems(items.filter((p) => p.id !== id));
      if (editingId === id) {
        setForm(DEFAULT);
        setEditingId("");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  const addImage = (val) => onChange("image", [...(form.image || []), val]);

  const shown = items.filter(
    (p) => !filter || p.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      {/* Form */}
      <form
        onSubmit={onSubmit}
        className="grid gap-3 max-w-3xl border rounded p-4"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit product" : "Add product"}
        </h2>

        <input
          className="border p-2"
          placeholder="id (unique)"
          value={form.id}
          onChange={(e) => onChange("id", e.target.value)}
          disabled={!!editingId}
        />
        <input
          className="border p-2"
          placeholder="name"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
        <textarea
          className="border p-2"
          placeholder="description"
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
        />
        <input
          className="border p-2"
          type="number"
          placeholder="price"
          value={form.price}
          onChange={(e) => onChange("price", Number(e.target.value) || 0)}
        />
        <input
          className="border p-2"
          placeholder="category"
          value={form.category}
          onChange={(e) => onChange("category", e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="subCategory"
          value={form.subCategory}
          onChange={(e) => onChange("subCategory", e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="sizes (comma: S,M,L)"
          value={form.sizes.join(",")}
          onChange={(e) =>
            onChange(
              "sizes",
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
        />

        {/* Images */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              id="imgin"
              className="border p-2 flex-1"
              placeholder="image URL or asset key"
            />
            <button
              type="button"
              className="border px-3"
              onClick={() => {
                const el = document.getElementById("imgin");
                if (el.value) {
                  addImage(el.value);
                  el.value = "";
                }
              }}
            >
              Add image
            </button>
          </div>
          <div className="text-sm opacity-70">
            Current: [{(form.image || []).join(", ")}]
          </div>
        </div>

        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.bestseller}
            onChange={(e) => onChange("bestseller", e.target.checked)}
          />
          Bestseller
        </label>

        <div className="flex gap-2">
          <button
            disabled={saving}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {saving ? "Saving..." : editingId ? "Update" : "Create"}
          </button>
          {editingId && (
            <button
              type="button"
              className="px-4 py-2 border rounded"
              onClick={() => {
                setForm(DEFAULT);
                setEditingId("");
              }}
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <section className="max-w-3xl">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-semibold">All products</h2>
          <input
            className="border p-2 ml-auto"
            placeholder="Search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <ul className="divide-y">
          {shown.map((p) => (
            <li key={p.id} className="py-3 flex items-center gap-3">
              <div className="font-medium">{p.name}</div>
              <div className="text-sm opacity-70">
                ({p.id}) • ${p.price}
              </div>
              <button
                className="ml-auto border px-3 py-1 rounded"
                onClick={() => onEdit(p.id)}
              >
                Edit
              </button>
              <button
                className="border px-3 py-1 rounded"
                onClick={() => onDelete(p.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
