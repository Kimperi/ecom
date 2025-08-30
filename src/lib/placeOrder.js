// src/lib/placeOrder.js
import { fetchAuthSession } from "@aws-amplify/auth";

// API Gateway endpoint for orders
const API_URL = "https://wvqjxgbjxg.execute-api.us-east-1.amazonaws.com/orders";

export async function placeOrder({ address, paymentMethod = "cod", shop }) {
  // Require login
  const session = await fetchAuthSession();
  const idToken = session?.tokens?.idToken?.toString();
  if (!idToken) throw new Error("You must be logged in to place an order.");

  if (!shop?.cartItems || !shop?.products) {
    throw new Error("Shop is not ready. Try again in a moment.");
  }


  const items = [];
  for (const productId of Object.keys(shop.cartItems)) {
    const sizes = shop.cartItems[productId] || {};
    const product = shop.products.find(
      (p) => String(p.id) === String(productId)    
    );

    for (const size of Object.keys(sizes)) {
      const qty = Number(sizes[size] || 0);
      if (!qty) continue;

      const unitPrice = Number(product?.price || 0); // number or numeric string
      items.push({
        id: productId,
        name: product?.name || String(productId),
        size,
        qty,
        price: unitPrice, // unit price sent to backend
        image: Array.isArray(product?.image) ? product.image[0] : product?.image || "",
      });
    }
  }

  if (items.length === 0) throw new Error("Your cart is empty.");

  // Totals (client-side; backend will recompute again)
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const shipping = Number(shop?.deliveryFee ?? 50);
  const totals = {
    subtotal,
    shipping,
    total: subtotal + shipping,
    currency: shop?.currency || "MAD",
  };

  // Minimal user info
  const p = session?.tokens?.idToken?.payload;
  const user = { id: p?.sub, email: p?.email, name: p?.name || p?.email };

  // Post to API
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ user, address, items, totals, paymentMethod }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Order failed (${res.status})`);
  return data; // { ok: true, ... }
}
