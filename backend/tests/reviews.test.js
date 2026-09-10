import assert from "node:assert/strict";
import test from "node:test";
import { createReviewsHandler } from "../src/functions/reviews/application.js";
import { ConflictError } from "../src/shared/http.js";

const FIXED_DATE = new Date("2026-09-10T10:00:00.000Z");

function apiEvent(method, { productId, body, claims } = {}) {
  const event = {
    requestContext: {
      requestId: "request-456",
      http: { method },
    },
  };

  if (productId !== undefined) {
    event.queryStringParameters = { productId };
  }
  if (body !== undefined) event.body = JSON.stringify(body);
  if (claims) event.requestContext.authorizer = { jwt: { claims } };
  return event;
}

function userClaims() {
  return { sub: "user-456", email: "not-used@example.test" };
}

function createTestHandler(repositoryOverrides = {}) {
  const repository = {
    list: async () => [],
    productExists: async () => true,
    create: async (review) => review,
    ...repositoryOverrides,
  };
  const logs = { info: [], error: [] };
  const logger = {
    info: (entry) => logs.info.push(entry),
    error: (entry) => logs.error.push(entry),
  };

  return {
    handler: createReviewsHandler({
      repository,
      clock: () => FIXED_DATE,
      createId: () => "review-456",
      logger,
    }),
    logs,
  };
}

function responseBody(response) {
  return response.body ? JSON.parse(response.body) : undefined;
}

test("lists reviews publicly for a valid product", async () => {
  const reviews = [{ reviewId: "one", rating: 5 }];
  const { handler } = createTestHandler({ list: async () => reviews });

  const response = await handler(apiEvent("GET", { productId: "product-1" }));

  assert.equal(response.statusCode, 200);
  assert.deepEqual(responseBody(response), reviews);
});

test("rejects a missing or invalid product identifier", async () => {
  const { handler } = createTestHandler();

  const missing = await handler(apiEvent("GET"));
  const invalid = await handler(
    apiEvent("GET", { productId: "../../unexpected" }),
  );

  assert.equal(missing.statusCode, 400);
  assert.equal(invalid.statusCode, 400);
});

test("requires authentication before creating a review", async () => {
  let createCalled = false;
  const { handler } = createTestHandler({
    create: async () => {
      createCalled = true;
    },
  });

  const response = await handler(
    apiEvent("POST", {
      productId: "product-1",
      body: { rating: 5, comment: "Excellent" },
    }),
  );

  assert.equal(response.statusCode, 401);
  assert.equal(createCalled, false);
});

test("rejects browser-owned identity and invalid review fields", async () => {
  let createCalled = false;
  const { handler } = createTestHandler({
    create: async () => {
      createCalled = true;
    },
  });

  const response = await handler(
    apiEvent("POST", {
      productId: "product-1",
      claims: userClaims(),
      body: {
        rating: 8,
        comment: "Unsafe\u0000comment",
        userId: "chosen-by-browser",
        name: "Fake identity",
      },
    }),
  );

  assert.equal(response.statusCode, 400);
  assert.equal(createCalled, false);
  const fields = responseBody(response).error.details.map(({ field }) => field);
  assert.ok(fields.includes("rating"));
  assert.ok(fields.includes("comment"));
  assert.ok(fields.includes("userId"));
  assert.ok(fields.includes("name"));
});

test("reports a review for an unknown product", async () => {
  const { handler } = createTestHandler({ productExists: async () => false });

  const response = await handler(
    apiEvent("POST", {
      productId: "missing-product",
      claims: userClaims(),
      body: { rating: 3, comment: "Cannot be stored" },
    }),
  );

  assert.equal(response.statusCode, 404);
  assert.equal(responseBody(response).error.code, "NOT_FOUND");
});

test("creates a review with identity and metadata owned by the server", async () => {
  let stored;
  const { handler, logs } = createTestHandler({
    create: async (review) => {
      stored = review;
      return review;
    },
  });

  const response = await handler(
    apiEvent("POST", {
      productId: "product-1",
      claims: userClaims(),
      body: { rating: 5, comment: "  Very good product  " },
    }),
  );

  assert.equal(response.statusCode, 201);
  assert.equal(stored.productId, "product-1");
  assert.equal(stored.userId, "user-456");
  assert.equal(stored.reviewId, "review-456");
  assert.equal(stored.name, "Verified customer");
  assert.equal(stored.comment, "Very good product");
  assert.equal(stored.createdAt, FIXED_DATE.toISOString());
  assert.equal(logs.info.length, 1);
  assert.equal(logs.info[0].includes("not-used@example.test"), false);
});

test("prevents a user from reviewing the same product twice", async () => {
  const { handler } = createTestHandler({
    create: async () => {
      throw new ConflictError("You have already reviewed this product.");
    },
  });

  const response = await handler(
    apiEvent("POST", {
      productId: "product-1",
      claims: userClaims(),
      body: { rating: 4, comment: "Already submitted" },
    }),
  );

  assert.equal(response.statusCode, 409);
  assert.equal(responseBody(response).error.code, "REVIEW_EXISTS");
});

test("returns a generic response for an unexpected dependency failure", async () => {
  const { handler, logs } = createTestHandler({
    list: async () => {
      throw new Error("private database detail");
    },
  });

  const response = await handler(apiEvent("GET", { productId: "product-1" }));
  const body = responseBody(response);

  assert.equal(response.statusCode, 500);
  assert.equal(body.error.code, "INTERNAL_ERROR");
  assert.equal(JSON.stringify(body).includes("database detail"), false);
  assert.equal(logs.error.length, 1);
});
