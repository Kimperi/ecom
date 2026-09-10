import { RequestValidationError } from "../../shared/http.js";

const ALLOWED_FIELDS = new Set(["rating", "comment"]);

export function validateReviewProductId(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(value)) {
    throw new RequestValidationError("The product identifier is invalid.", [
      { field: "productId", message: "is required and has an invalid format" },
    ]);
  }
  return value;
}

export function validateReviewPayload(input) {
  const details = [];

  for (const field of Object.keys(input)) {
    if (!ALLOWED_FIELDS.has(field)) {
      details.push({ field, message: "is not allowed" });
    }
  }

  const rating = input.rating;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    details.push({ field: "rating", message: "must be an integer from 1 to 5" });
  }

  const comment = typeof input.comment === "string" ? input.comment.trim() : "";
  if (comment.length === 0 || comment.length > 1_000) {
    details.push({
      field: "comment",
      message: "must contain between 1 and 1000 characters",
    });
  }
  if (/\p{Cc}/u.test(comment)) {
    details.push({
      field: "comment",
      message: "must not contain control characters",
    });
  }

  if (details.length > 0) {
    throw new RequestValidationError("Review validation failed.", details);
  }

  return { rating, comment };
}
