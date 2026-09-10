import { config, isDemo } from '../config.js';
import { authHeaders, requestJson } from './http.js';
import { validateReview } from './validation.js';
export async function listReviews(productId) {
  if (isDemo) return (await import('../demo/store.js')).listDemoReviews(productId);
  const result = await requestJson(
    `${config.reviewsUrl}?productId=${encodeURIComponent(productId)}`,
  );
  return Array.isArray(result) ? result : [];
}
export async function createReview(productId, form) {
  const clean = validateReview(form);
  if (isDemo) return (await import('../demo/store.js')).addDemoReview(productId, clean);
  return requestJson(`${config.reviewsUrl}?productId=${encodeURIComponent(productId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders(true)) },
    body: JSON.stringify({ ...clean, name: form.name || 'Customer' }),
  });
}
