import { config, isDemo } from '../config.js';
import { authHeaders, requestJson } from './http.js';
import { validateProduct } from './validation.js';
const demo = () => import('../demo/store.js');
export async function listProducts() {
  if (isDemo) return (await demo()).listDemoProducts();
  return requestJson(`${config.productsUrl}/products`);
}
export async function getProduct(id) {
  if (isDemo) return (await demo()).getDemoProduct(id);
  return requestJson(`${config.productsUrl}/products/${encodeURIComponent(id)}`);
}
export async function createProduct(product) {
  const clean = validateProduct(product);
  if (isDemo) return (await demo()).saveDemoProduct(clean);
  return requestJson(`${config.productsUrl}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders(true)) },
    body: JSON.stringify(clean),
  });
}
export async function updateProduct(id, patch) {
  const clean = validateProduct({ ...patch, id });
  if (isDemo) return (await demo()).saveDemoProduct(clean, id);
  const { id: _id, ...body } = clean;
  return requestJson(`${config.productsUrl}/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders(true)) },
    body: JSON.stringify(body),
  });
}
export async function deleteProduct(id) {
  if (isDemo) return (await demo()).deleteDemoProduct(id);
  return requestJson(`${config.productsUrl}/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: await authHeaders(true),
  });
}
