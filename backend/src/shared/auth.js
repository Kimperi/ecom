export class AuthenticationError extends Error {
  constructor(message = "Authentication is required.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "You are not allowed to perform this operation.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

function parseGroups(value) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string" || value.trim() === "") return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // API Gateway can also provide the groups as a comma-separated string.
  }

  return value
    .split(",")
    .map((group) => group.trim())
    .filter(Boolean);
}

export function authenticatedPrincipal(event) {
  const claims =
    event?.requestContext?.authorizer?.jwt?.claims ||
    event?.requestContext?.authorizer?.claims;

  if (!claims?.sub) throw new AuthenticationError();

  return {
    id: String(claims.sub),
    groups: parseGroups(claims["cognito:groups"]),
  };
}

export function requireGroup(event, requiredGroup) {
  const principal = authenticatedPrincipal(event);
  if (!principal.groups.includes(requiredGroup)) throw new AuthorizationError();
  return principal;
}
