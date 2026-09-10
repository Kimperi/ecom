import { fetchAuthSession } from "@aws-amplify/auth";
import { API_BASE_URL } from "../config";

export async function placeOrder({ address, paymentMethod = "cod", shop }) {
  const session = await fetchAuthSession();
  const accessToken = session?.tokens?.accessToken?.toString();
  if (!accessToken) throw new Error("You must be logged in to place an order.");

  if (!shop?.cartItems || !shop?.products) {
    throw new Error("Shop is not ready. Try again in a moment.");
  }

  const items = [];
  for (const productId of Object.keys(shop.cartItems)) {
    const sizes = shop.cartItems[productId] || {};

    for (const size of Object.keys(sizes)) {
      const quantity = Number(sizes[size] || 0);
      if (!quantity) continue;

      items.push({
        id: productId,
        size,
        quantity,
      });
    }
  }

  if (items.length === 0) throw new Error("Your cart is empty.");

  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ address, items, paymentMethod }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || `Order failed (${response.status})`);
  }
  return data;
}
