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
import { buildOrder, orderReceipt, validateOrderPayload } from "./order.js";

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
      { error: { code: "ORDER_CONFLICT", message: error.message } },
      requestId,
    );
  }
  return jsonResponse(
    500,
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "The order could not be completed.",
      },
    },
    requestId,
  );
}

export function createOrdersHandler({
  repository,
  notifier,
  deliveryFeeMinor,
  currency,
  clock = () => new Date(),
  createId = randomUUID,
  logger = console,
}) {
  if (!repository) throw new Error("An orders repository is required.");
  if (!notifier) throw new Error("An order notifier is required.");

  return async function ordersHandler(event) {
    const { requestId, method } = requestMetadata(event);
    if (method !== "POST") {
      return jsonResponse(
        405,
        {
          error: {
            code: "METHOD_NOT_ALLOWED",
            message: "This order operation is not supported.",
          },
        },
        requestId,
      );
    }

    try {
      const principal = authenticatedPrincipal(event);
      const input = validateOrderPayload(parseJsonBody(event));
      const productIds = [...new Set(input.items.map((item) => item.id))];
      const products = await repository.getProducts(productIds);
      const order = buildOrder({
        input,
        products,
        userId: principal.id,
        orderId: createId(),
        createdAt: clock().toISOString(),
        deliveryFeeMinor,
        currency,
      });

      await repository.create(order);
      logRequest(logger, "order.created", {
        requestId,
        actorId: principal.id,
        orderId: order.orderId,
        itemCount: order.items.length,
        totalMinor: order.totalMinor,
      });

      try {
        await notifier.send(order);
      } catch (error) {
        logFailure(logger, "order.notification_failed", error, {
          requestId,
          orderId: order.orderId,
        });
      }

      return jsonResponse(201, orderReceipt(order), requestId);
    } catch (error) {
      if (
        !(error instanceof RequestValidationError) &&
        !(error instanceof AuthenticationError) &&
        !(error instanceof ConflictError)
      ) {
        logFailure(logger, "order.failed", error, { requestId, method });
      }
      return errorResponse(error, requestId);
    }
  };
}
