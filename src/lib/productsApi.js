import { fetchAuthSession } from "@aws-amplify/auth";
import { API_BASE_URL } from "../config";

async function authHeader(forceRefresh = false) {
  try {
    const session = await fetchAuthSession({ forceRefresh });
    const token =
      session?.tokens?.accessToken?.toString() ||
      session?.tokens?.idToken?.toString() ||
      "";
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function requestUploadPermission(file, forceRefresh = false) {
  const authorization = await authHeader(forceRefresh);
  if (!authorization.Authorization) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  return fetch(`${API_BASE_URL}/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authorization },
    body: JSON.stringify({ contentType: file.type, size: file.size }),
  });
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

export async function uploadProductImage(file) {
  let permissionResponse = await requestUploadPermission(file);

  // Cognito group changes appear only in newly issued tokens. Refresh once so
  // a recently promoted administrator does not have to clear browser storage.
  if (permissionResponse.status === 403) {
    permissionResponse = await requestUploadPermission(file, true);
  }

  if (!permissionResponse.ok) {
    throw new Error(`Upload authorization failed (${permissionResponse.status})`);
  }

  const { uploadUrl, fields, assetUrl } = await permissionResponse.json();
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
  formData.append("file", file);

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Image upload failed (${uploadResponse.status})`);
  }

  return assetUrl;
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
