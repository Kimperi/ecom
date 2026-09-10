import { randomUUID } from "node:crypto";
import {
  AuthenticationError,
  authenticatedPrincipal,
} from "../../shared/auth.js";
import {
  ConflictError,
  jsonResponse,
  parseJsonBody,
  requestMetadata,
  RequestValidationError,
} from "../../shared/http.js";
import { logFailure, logRequest } from "../../shared/logging.js";
import { validateReviewPayload, validateReviewProductId } from "./review.js";

function errorResponse(error, requestId) {
  if (error instanceof RequestValidationError) {
    return jsonResponse(
      400,
      {
        error: {
          code: "VALIDATION_ERROR",
          message: error.message,
          details: error.details,
        },
      },
      requestId,
    );
  }
  if (error instanceof AuthenticationError) {
    return jsonResponse(
      401,
      { error: { code: "UNAUTHENTICATED", message: error.message } },
      requestId,
    );
  }
  if (error instanceof ConflictError) {
    return jsonResponse(
      409,
      { error: { code: "REVIEW_EXISTS", message: error.message } },
      requestId,
    );
  }
  return jsonResponse(
    500,
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "The review operation could not be completed.",
      },
    },
    requestId,
  );
}

export function createReviewsHandler({
  repository,
  clock = () => new Date(),
  createId = randomUUID,
  logger = console,
}) {
  if (!repository) throw new Error("A reviews repository is required.");

  return async function reviewsHandler(event) {
    const { requestId, method } = requestMetadata(event);

    try {
      const productId = validateReviewProductId(
        event?.queryStringParameters?.productId,
      );

      if (method === "GET") {
        const reviews = await repository.list(productId);
        return jsonResponse(200, reviews, requestId);
      }

      if (method === "POST") {
        const principal = authenticatedPrincipal(event);
        const reviewInput = validateReviewPayload(parseJsonBody(event));
        const productExists = await repository.productExists(productId);
        if (!productExists) {
          return jsonResponse(
            404,
            { error: { code: "NOT_FOUND", message: "Product not found." } },
            requestId,
          );
        }

        const review = await repository.create({
          ...reviewInput,
          productId,
          userId: principal.id,
          reviewId: createId(),
          name: "Verified customer",
          createdAt: clock().toISOString(),
        });
        logRequest(logger, "review.created", {
          requestId,
          actorId: principal.id,
          productId,
          reviewId: review.reviewId,
        });
        return jsonResponse(201, review, requestId);
      }

      return jsonResponse(
        405,
        {
          error: {
            code: "METHOD_NOT_ALLOWED",
            message: "This review operation is not supported.",
          },
        },
        requestId,
      );
    } catch (error) {
      if (
        !(error instanceof RequestValidationError) &&
        !(error instanceof AuthenticationError) &&
        !(error instanceof ConflictError)
      ) {
        logFailure(logger, "review.failed", error, { requestId, method });
      }
      return errorResponse(error, requestId);
    }
  };
}
