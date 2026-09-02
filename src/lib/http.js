import { fetchAuthSession } from '../auth/client.js';

export async function authHeaders(required = false) {
  const session = await fetchAuthSession();
  // Preserve the historical Cognito ID-token API contract; enforce roles on the server.
  const token = session?.tokens?.idToken?.toString();
  if (!token || token === '[object Object]') {
    if (required) throw new Error('Please log in to continue.');
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}
export async function requestJson(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    const messages = {
      401: 'Please log in to continue.',
      403: 'You do not have permission for this action.',
      404: 'This item was not found.',
      409: 'This entry already exists.',
      429: 'Too many requests. Please try again later.',
    };
    throw new Error(
      messages[response.status] || `Request failed (${response.status}). Please try again.`,
    );
  }
  if (response.status === 204) return null;
  return response.json();
}
