import { randomUUID } from "node:crypto";
import {
  AuthenticationError,
  AuthorizationError,
  requireGroup,
} from "../../shared/auth.js";
import {
  jsonResponse,
  noContentResponse,
  parseJsonBody,
  requestMetadata,
  RequestValidationError,
} from "../../shared/http.js";
import { logFailure, logRequest } from "../../shared/logging.js";
import { validateProductId, validateProductPayload } from "./product.js";

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
  if (error instanceof AuthorizationError) {
    return jsonResponse(
      403,
      { error: { code: "FORBIDDEN", message: error.message } },
      requestId,
    );
  }
  return jsonResponse(
    500,
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "The product operation could not be completed.",
      },
    },
    requestId,
  );
}

export function createProductsHandler({
  repository,
  clock = () => new Date(),
  createId = randomUUID,
  logger = console,
}) {
  if (!repository) throw new Error("A products repository is required.");

  return async function productsHandler(event) {
    const { requestId, method } = requestMetadata(event);
    const rawId = event?.pathParameters?.id;

    try {
      if (method === "GET" && !rawId) {
        const products = await repository.list();
        return jsonResponse(200, products, requestId);
      }

      if (method === "GET" && rawId) {
        const id = validateProductId(rawId);
        const product = await repository.get(id);
        if (!product) {
          return jsonResponse(
            404,
            { error: { code: "NOT_FOUND", message: "Product not found." } },
            requestId,
          );
        }
        return jsonResponse(200, product, requestId);
      }

      if (method === "POST" && !rawId) {
        const principal = requireGroup(event, "admin");
        const product = validateProductPayload(parseJsonBody(event));
        const now = clock();
        const created = await repository.create({
          ...product,
          id: createId(),
          date: now.getTime(),
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        });
        logRequest(logger, "product.created", {
          requestId,
          actorId: principal.id,
          productId: created.id,
        });
        return jsonResponse(201, created, requestId);
      }

      if (method === "PUT" && rawId) {
        const principal = requireGroup(event, "admin");
        const id = validateProductId(rawId);
        const product = validateProductPayload(parseJsonBody(event));
        const updated = await repository.update(id, {
          ...product,
          updatedAt: clock().toISOString(),
        });
        if (!updated) {
          return jsonResponse(
            404,
            { error: { code: "NOT_FOUND", message: "Product not found." } },
            requestId,
          );
        }
        logRequest(logger, "product.updated", {
          requestId,
          actorId: principal.id,
          productId: id,
        });
        return jsonResponse(200, updated, requestId);
      }

      if (method === "DELETE" && rawId) {
        const principal = requireGroup(event, "admin");
        const id = validateProductId(rawId);
        const deleted = await repository.delete(id);
        if (!deleted) {
          return jsonResponse(
            404,
            { error: { code: "NOT_FOUND", message: "Product not found." } },
            requestId,
          );
        }
        logRequest(logger, "product.deleted", {
          requestId,
          actorId: principal.id,
          productId: id,
        });
        return noContentResponse(requestId);
      }

      return jsonResponse(
        405,
        {
          error: {
            code: "METHOD_NOT_ALLOWED",
            message: "This product operation is not supported.",
          },
        },
        requestId,
      );
    } catch (error) {
      if (
        !(error instanceof RequestValidationError) &&
        !(error instanceof AuthenticationError) &&
        !(error instanceof AuthorizationError)
      ) {
        logFailure(logger, "product.failed", error, { requestId, method });
      }
      return errorResponse(error, requestId);
    }
  };
}
