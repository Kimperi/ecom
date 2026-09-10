import { fetchAuthSession } from '../auth/client.js';
import { config, isDemo } from '../config.js';
import { authHeaders, requestJson } from './http.js';
import { buildOrderItems, orderTotals, validateAddress } from './validation.js';

export async function placeOrder({ address, paymentMethod = 'cod', shop }) {
  const session = await fetchAuthSession();
  const p = session?.tokens?.idToken?.payload;
  if (!p?.sub) throw new Error('Please log in to continue.');
  if (paymentMethod !== 'cod') throw new Error('Only cash on delivery is supported.');
  const cleanAddress = validateAddress(address);
  const items = buildOrderItems(shop?.cartItems, shop?.products);
  const totals = orderTotals(items);
  if (isDemo) {
    // No address, payment details or order is saved or transmitted.
    return {
      demo: true,
      reference: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      totals,
    };
  }
  const user = { id: p.sub, email: p.email, name: p.name || p.email };
  const result = await requestJson(config.ordersUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders(true)) },
    body: JSON.stringify({ user, address: cleanAddress, items, totals, paymentMethod }),
  });
  if (result?.ok === false) throw new Error('The order request was not accepted.');
  // The historical endpoint sends an email, not a verified payment or durable order.
  return { demo: false, reference: result?.orderId || null };
}
