export const MAX_QUANTITY = 99;
export const DELIVERY_FEE = 50;
export const CURRENCY = 'MAD';
const reserved = new Set(['__proto__', 'prototype', 'constructor']);
export function validKey(value) {
  return (
    typeof value === 'string' && value.length > 0 && value.length <= 100 && !reserved.has(value)
  );
}
export function validQuantity(value) {
  return Number.isInteger(value) && value >= 1 && value <= MAX_QUANTITY;
}
export function sanitizeCart(value) {
  const result = {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
  for (const [id, sizes] of Object.entries(value)) {
    if (!validKey(id) || !sizes || typeof sizes !== 'object' || Array.isArray(sizes)) continue;
    for (const [size, qty] of Object.entries(sizes)) {
      if (!validKey(size) || !validQuantity(qty)) continue;
      result[id] ??= {};
      result[id][size] = qty;
    }
  }
  return result;
}
export function validateAddress(address = {}) {
  const required = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'street',
    'city',
    'state',
    'zip',
    'country',
  ];
  const clean = {};
  for (const key of required) {
    const value = typeof address[key] === 'string' ? address[key].trim() : '';
    if (!value || value.length > 200)
      throw new Error('Complete the delivery address (maximum 200 characters per field).');
    clean[key] = value;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email))
    throw new Error('Enter a valid email address.');
  if (!/^\d{6,15}$/.test(clean.phone)) throw new Error('Enter a phone number with 6 to 15 digits.');
  return clean;
}
export function buildOrderItems(cart, products) {
  if (!cart || typeof cart !== 'object' || Array.isArray(cart) || !Array.isArray(products))
    throw new Error('Invalid cart.');
  const items = [];
  for (const [id, sizes] of Object.entries(cart)) {
    if (!validKey(id) || !sizes || typeof sizes !== 'object' || Array.isArray(sizes))
      throw new Error('Invalid cart item.');
    const product = products.find((item) => String(item.id) === id);
    if (!product) throw new Error('A product is no longer available. Remove it from your cart.');
    const price = Number(product.price);
    if (!Number.isFinite(price) || price <= 0) throw new Error('A product has an invalid price.');
    for (const [size, qty] of Object.entries(sizes)) {
      if (!validKey(size) || !validQuantity(qty))
        throw new Error(`Quantities must be whole numbers from 1 to ${MAX_QUANTITY}.`);
      if (!Array.isArray(product.sizes) || !product.sizes.includes(size))
        throw new Error('This product size is unavailable.');
      items.push({ id, name: product.name, size, qty, price, image: product.image?.[0] || '' });
    }
  }
  if (!items.length) throw new Error('Your cart is empty.');
  return items;
}
export function orderTotals(items) {
  const subtotal =
    items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.qty, 0) / 100;
  return { subtotal, shipping: DELIVERY_FEE, total: subtotal + DELIVERY_FEE, currency: CURRENCY };
}
export function validateReview({ rating, comment }) {
  const clean = typeof comment === 'string' ? comment.trim() : '';
  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5)
    throw new Error('Choose a whole-number rating from 1 to 5.');
  if (!clean || clean.length > 1000)
    throw new Error('Write a review between 1 and 1,000 characters.');
  return { rating: Number(rating), comment: clean };
}
export function validateProduct(product) {
  if (!validKey(String(product.id || ''))) throw new Error('Enter a valid product ID.');
  if (typeof product.name !== 'string' || !product.name.trim() || product.name.length > 120)
    throw new Error('Enter a product name (maximum 120 characters).');
  if (!Number.isFinite(Number(product.price)) || Number(product.price) <= 0)
    throw new Error('Price must be a positive number.');
  if (!Array.isArray(product.sizes) || !product.sizes.length || !product.sizes.every(validKey))
    throw new Error('Provide valid product sizes.');
  if (!Array.isArray(product.image) || !product.image.length || !product.image.every(safeImageUrl))
    throw new Error('Use a local image path or an HTTPS image URL.');
  return { ...product, name: product.name.trim(), price: Number(product.price) };
}
export function safeImageUrl(value) {
  if (typeof value !== 'string') return false;
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}
export function safeRedirect(value) {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\r\n]/.test(value)
  )
    return '/';
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith('//') || decoded.includes('\\')) return '/';
    const url = new URL(value, 'https://local.invalid');
    return url.origin === 'https://local.invalid' ? url.pathname + url.search + url.hash : '/';
  } catch {
    return '/';
  }
}
