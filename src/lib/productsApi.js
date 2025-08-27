
// src/lib/productsApi.js
import { fetchAuthSession } from "@aws-amplify/auth";

// <<< set this >>>
const API_BASE = "https://dhpo2yclof.execute-api.us-east-1.amazonaws.com";


// always prefer ID token for API Gateway JWT authorizer; fallback to access token
async function authHeader() {
  try {
    const s = await fetchAuthSession();
    const token =
      s?.tokens?.idToken?.toString() ||
      s?.tokens?.accessToken?.toString() ||
      "";
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function listProducts() {
  const r = await fetch(`${API_BASE}/products`, {
    method: "GET",
    headers: await authHeader(), // include if your GET is protected
  });
  if (!r.ok) throw new Error(`List failed (${r.status})`);
  return r.json();
}

export async function getProduct(id) {
  const r = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: await authHeader(), // include if protected
  });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Get failed (${r.status})`);
  return r.json();
}

export async function createProduct(prod) {
  const r = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(prod),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Create failed (${r.status}) ${t}`);
  }
  return r.json();
}

export async function updateProduct(id, patch) {
  const r = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(patch),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Update failed (${r.status}) ${t}`);
  }
  return r.json();
}

export async function deleteProduct(id) {
  const r = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: await authHeader(),
  });
  if (!r.ok && r.status !== 204) {
    const t = await r.text().catch(() => "");
    throw new Error(`Delete failed (${r.status}) ${t}`);
  }
  return true;
}
