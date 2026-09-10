import { RequestValidationError } from "../../shared/http.js";

const ALLOWED_FIELDS = new Set([
  "name",
  "description",
  "price",
  "image",
  "category",
  "subCategory",
  "sizes",
  "bestseller",
]);

function addIssue(issues, field, message) {
  issues.push({ field, message });
}

function cleanRequiredText(input, field, maximumLength, issues) {
  const value = input[field];
  if (typeof value !== "string") {
    addIssue(issues, field, "must be a string");
    return "";
  }

  const cleaned = value.trim();
  if (cleaned.length === 0) addIssue(issues, field, "is required");
  if (cleaned.length > maximumLength) {
    addIssue(issues, field, `must contain at most ${maximumLength} characters`);
  }
  if (/\p{Cc}/u.test(cleaned)) {
    addIssue(issues, field, "must not contain control characters");
  }
  return cleaned;
}

function cleanPrice(value, issues) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    addIssue(issues, "price", "must be a finite number");
    return 0;
  }
  if (value <= 0 || value > 1_000_000) {
    addIssue(issues, "price", "must be greater than 0 and at most 1000000");
  }
  return Math.round(value * 100) / 100;
}

function cleanSizes(value, issues) {
  if (!Array.isArray(value) || value.length > 20) {
    addIssue(issues, "sizes", "must be an array containing at most 20 values");
    return [];
  }

  const cleaned = value
    .filter((size) => typeof size === "string")
    .map((size) => size.trim())
    .filter(Boolean);

  if (cleaned.length !== value.length) {
    addIssue(issues, "sizes", "must contain only non-empty strings");
  }
  if (cleaned.some((size) => size.length > 20)) {
    addIssue(issues, "sizes", "values must contain at most 20 characters");
  }
  if (new Set(cleaned).size !== cleaned.length) {
    addIssue(issues, "sizes", "must not contain duplicate values");
  }
  return cleaned;
}

function cleanImages(value, issues) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 8) {
    addIssue(issues, "image", "must contain between 1 and 8 HTTPS URLs");
    return [];
  }

  return value.map((candidate, index) => {
    if (typeof candidate !== "string" || candidate.length > 2_048) {
      addIssue(issues, `image[${index}]`, "must be a valid HTTPS URL");
      return "";
    }

    try {
      const url = new URL(candidate);
      if (url.protocol !== "https:" || url.username || url.password) {
        throw new Error("Unsafe URL");
      }
      return url.toString();
    } catch {
      addIssue(issues, `image[${index}]`, "must be a valid HTTPS URL");
      return "";
    }
  });
}

export function validateProductPayload(input) {
  const issues = [];

  for (const field of Object.keys(input)) {
    if (!ALLOWED_FIELDS.has(field)) addIssue(issues, field, "is not allowed");
  }

  const product = {
    name: cleanRequiredText(input, "name", 120, issues),
    description: cleanRequiredText(input, "description", 2_000, issues),
    price: cleanPrice(input.price, issues),
    image: cleanImages(input.image, issues),
    category: cleanRequiredText(input, "category", 60, issues),
    subCategory: cleanRequiredText(input, "subCategory", 60, issues),
    sizes: cleanSizes(input.sizes, issues),
    bestseller: input.bestseller,
  };

  if (typeof product.bestseller !== "boolean") {
    addIssue(issues, "bestseller", "must be a boolean");
  }

  if (issues.length > 0) {
    throw new RequestValidationError("Product validation failed.", issues);
  }

  return product;
}

export function validateProductId(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(value)) {
    throw new RequestValidationError("The product identifier is invalid.", [
      { field: "id", message: "must contain only letters, numbers, _ or -" },
    ]);
  }
  return value;
}
