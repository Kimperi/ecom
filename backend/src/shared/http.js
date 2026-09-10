export class RequestValidationError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = "RequestValidationError";
    this.details = details;
  }
}

export class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictError";
  }
}

const SECURITY_HEADERS = Object.freeze({
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff",
});

export function jsonResponse(statusCode, body, requestId) {
  const headers = { ...SECURITY_HEADERS };
  if (requestId) headers["x-request-id"] = requestId;

  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
}

export function noContentResponse(requestId) {
  const headers = { ...SECURITY_HEADERS };
  delete headers["content-type"];
  if (requestId) headers["x-request-id"] = requestId;

  return {
    statusCode: 204,
    headers,
  };
}

export function parseJsonBody(event, maximumBytes = 32_768) {
  if (typeof event?.body !== "string" || event.body.length === 0) {
    throw new RequestValidationError("A JSON request body is required.");
  }

  const decoded = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;

  if (Buffer.byteLength(decoded, "utf8") > maximumBytes) {
    throw new RequestValidationError("The request body is too large.");
  }

  try {
    const value = JSON.parse(decoded);
    if (!value || Array.isArray(value) || typeof value !== "object") {
      throw new RequestValidationError("The JSON body must be an object.");
    }
    return value;
  } catch (error) {
    if (error instanceof RequestValidationError) throw error;
    throw new RequestValidationError("The request body is not valid JSON.");
  }
}

export function requestMetadata(event) {
  return {
    requestId: event?.requestContext?.requestId || "unknown",
    method:
      event?.requestContext?.http?.method || event?.httpMethod || "UNKNOWN",
  };
}
