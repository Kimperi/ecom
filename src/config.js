function requiredEnvironmentVariable(name) {
  const value = import.meta.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function httpsBaseUrl(name) {
  const value = requiredEnvironmentVariable(name).replace(/\/+$/, "");

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") throw new Error("HTTPS is required");
    return url.toString().replace(/\/+$/, "");
  } catch {
    throw new Error(`${name} must be a valid HTTPS URL`);
  }
}

export const API_BASE_URL = httpsBaseUrl("VITE_API_BASE_URL");

export const COGNITO_CONFIG = Object.freeze({
  userPoolId: requiredEnvironmentVariable("VITE_COGNITO_USER_POOL_ID"),
  userPoolClientId: requiredEnvironmentVariable(
    "VITE_COGNITO_USER_POOL_CLIENT_ID",
  ),
});
