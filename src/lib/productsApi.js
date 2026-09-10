import { fetchAuthSession } from "@aws-amplify/auth";
import { API_BASE_URL } from "../config";

async function authHeader() {
  try {
    const session = await fetchAuthSession();
    const token =
      session?.tokens?.accessToken?.toString() ||
      session?.tokens?.idToken?.toString() ||
      "";
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function listProducts() {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "GET",
    headers: await authHeader(),
  });
  if (!response.ok) throw new Error(`List failed (${response.status})`);
  return response.json();
}

export async function getProduct(id) {
  const response = await fetch(
    `${API_BASE_URL}/products/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: await authHeader(),
    },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Get failed (${response.status})`);
  return response.json();
}

export async function createProduct(product) {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(product),
  });
  if (!response.ok) throw new Error(`Create failed (${response.status})`);
  return response.json();
}

export async function updateProduct(id, product) {
  const response = await fetch(
    `${API_BASE_URL}/products/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeader()),
      },
      body: JSON.stringify(product),
    },
  );
  if (!response.ok) throw new Error(`Update failed (${response.status})`);
  return response.json();
}

export async function deleteProduct(id) {
  const response = await fetch(
    `${API_BASE_URL}/products/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: await authHeader(),
    },
  );
  if (!response.ok && response.status !== 204) {
    throw new Error(`Delete failed (${response.status})`);
  }
  return true;
}
