import { products as originalProducts } from '../assets/assets.js';
import { isDemo } from '../config.js';
import { fetchAuthSession } from '../auth/client.js';
import { validateProduct, validateReview } from '../lib/validation.js';

// Fictional sample data; changes reset on page reload.
let products = originalProducts.map(({ _id, ...product }) => ({ ...product, id: _id }));
let reviews = [
  {
    reviewId: 'sample-review',
    productId: 'aaaaa',
    name: 'Demo customer',
    rating: 5,
    comment: 'Sample review for the local portfolio demonstration.',
    createdAt: '2025-08-01T10:00:00Z',
  },
];
const copy = (value) => structuredClone(value);
function assertDemo() {
  if (!isDemo) throw new Error('Local fixtures are disabled in AWS mode.');
}
async function requireDemoUser(admin = false) {
  assertDemo();
  const p = (await fetchAuthSession())?.tokens?.idToken?.payload;
  if (!p?.sub) throw new Error('Choose a demo profile first.');
  if (admin && !p['cognito:groups'].includes('admin'))
    throw new Error('Choose the demo administrator profile.');
  return p;
}
export async function listDemoProducts() {
  assertDemo();
  return copy(products);
}
export async function getDemoProduct(id) {
  assertDemo();
  return copy(products.find((p) => p.id === id) || null);
}
export async function saveDemoProduct(product, editingId) {
  await requireDemoUser(true);
  const clean = validateProduct(product);
  if (editingId) {
    if (!products.some((p) => p.id === editingId)) throw new Error('Product not found.');
    products = products.map((p) => (p.id === editingId ? { ...clean, id: editingId } : p));
  } else {
    if (products.some((p) => p.id === clean.id)) throw new Error('This product ID already exists.');
    products = [...products, clean];
  }
  return copy(clean);
}
export async function deleteDemoProduct(id) {
  await requireDemoUser(true);
  products = products.filter((p) => p.id !== id);
}
export async function listDemoReviews(productId) {
  assertDemo();
  return copy(reviews.filter((r) => r.productId === productId));
}
export async function addDemoReview(productId, data) {
  const user = await requireDemoUser();
  const clean = validateReview(data);
  if (reviews.some((r) => r.productId === productId && r.userId === user.sub))
    throw new Error('You already reviewed this product in this demo session.');
  const review = {
    ...clean,
    productId,
    userId: user.sub,
    name: user.name,
    reviewId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  reviews = [review, ...reviews];
  return copy(review);
}
