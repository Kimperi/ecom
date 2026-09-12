import assert from "node:assert/strict";
import test from "node:test";
import { createProductsHandler } from "../src/functions/products/application.js";

const FIXED_DATE = new Date("2026-09-10T10:00:00.000Z");

const validProduct = Object.freeze({
  name: "Cloud Hoodie",
  description: "A secure serverless product.",
  price: 499.95,
  image: ["https://images.example.com/cloud-hoodie.png"],
  category: "Men",
  subCategory: "Topwear",
  sizes: ["S", "M", "L"],
  bestseller: true,
});

function apiEvent(method, { id, body, claims, routeKey } = {}) {
  const event = {
    routeKey,
    requestContext: {
      requestId: "request-123",
      http: { method },
    },
  };

  if (id) event.pathParameters = { id };
  if (body !== undefined) event.body = JSON.stringify(body);
  if (claims) event.requestContext.authorizer = { jwt: { claims } };
  return event;
}

function adminClaims(groups = '["admin"]') {
  return { sub: "user-123", "cognito:groups": groups };
}

function createTestHandler(repositoryOverrides = {}, mediaOverrides = {}) {
  const repository = {
    list: async () => [],
    get: async () => null,
    create: async (product) => product,
    update: async (id, product) => ({ id, ...product }),
    delete: async () => ({ id: "deleted" }),
    ...repositoryOverrides,
  };
  const logs = { info: [], error: [] };
  const logger = {
    info: (entry) => logs.info.push(entry),
    error: (entry) => logs.error.push(entry),
  };
  const media = {
    createUpload: async () => ({
      uploadUrl: "https://upload.example.com",
      fields: { key: "products/image.webp" },
      assetUrl: "https://cdn.example.com/products/image.webp",
      expiresIn: 300,
      maxBytes: 5_242_880,
    }),
    ...mediaOverrides,
  };

  return {
    handler: createProductsHandler({
      repository,
      media,
      clock: () => FIXED_DATE,
      createId: () => "product-123",
      logger,
    }),
    logs,
  };
}

function responseBody(response) {
  return response.body ? JSON.parse(response.body) : undefined;
}

test("lists products without requiring authentication", async () => {
  const products = [{ id: "one", date: 1 }];
  const { handler } = createTestHandler({ list: async () => products });

  const response = await handler(apiEvent("GET"));

  assert.equal(response.statusCode, 200);
  assert.deepEqual(responseBody(response), products);
  assert.equal(response.headers["cache-control"], "no-store");
});

test("returns one product or 404", async () => {
  const { handler } = createTestHandler({
    get: async (id) => (id === "known" ? { id, name: "Known" } : null),
  });

  const found = await handler(apiEvent("GET", { id: "known" }));
  const missing = await handler(apiEvent("GET", { id: "missing" }));

  assert.equal(found.statusCode, 200);
  assert.equal(responseBody(found).id, "known");
  assert.equal(missing.statusCode, 404);
});

test("rejects an unauthenticated product creation", async () => {
  let createCalled = false;
  const { handler } = createTestHandler({
    create: async () => {
      createCalled = true;
    },
  });

  const response = await handler(apiEvent("POST", { body: validProduct }));

  assert.equal(response.statusCode, 401);
  assert.equal(createCalled, false);
});

test("rejects an authenticated user outside the admin group", async () => {
  const { handler } = createTestHandler();
  const response = await handler(
    apiEvent("POST", {
      body: validProduct,
      claims: adminClaims('["customer"]'),
    }),
  );

  assert.equal(response.statusCode, 403);
  assert.equal(responseBody(response).error.code, "FORBIDDEN");
});

test("rejects unexpected fields and unsafe product values", async () => {
  let createCalled = false;
  const { handler } = createTestHandler({
    create: async () => {
      createCalled = true;
    },
  });
  const response = await handler(
    apiEvent("POST", {
      claims: adminClaims(),
      body: {
        ...validProduct,
        id: "chosen-by-browser",
        price: -50,
        image: ["http://insecure.example.com/image.png"],
      },
    }),
  );

  assert.equal(response.statusCode, 400);
  assert.equal(createCalled, false);
  const fields = responseBody(response).error.details.map(({ field }) => field);
  assert.ok(fields.includes("id"));
  assert.ok(fields.includes("price"));
  assert.ok(fields.includes("image[0]"));
});

test("creates a validated product with server-owned metadata", async () => {
  let stored;
  const { handler, logs } = createTestHandler({
    create: async (product) => {
      stored = product;
      return product;
    },
  });
  const response = await handler(
    apiEvent("POST", {
      claims: adminClaims("admin,staff"),
      body: { ...validProduct, name: "  Cloud Hoodie  " },
    }),
  );

  assert.equal(response.statusCode, 201);
  assert.equal(stored.id, "product-123");
  assert.equal(stored.name, "Cloud Hoodie");
  assert.equal(stored.date, FIXED_DATE.getTime());
  assert.equal(stored.createdAt, FIXED_DATE.toISOString());
  assert.equal(stored.updatedAt, FIXED_DATE.toISOString());
  assert.equal(logs.info.length, 1);
  assert.equal(logs.info[0].includes("Bearer"), false);
});

test("creates an upload permission only for an administrator", async () => {
  let received;
  const { handler } = createTestHandler({}, {
    createUpload: async (input) => {
      received = input;
      return {
        uploadUrl: "https://upload.example.com",
        fields: { key: "products/image.webp" },
        assetUrl: "https://cdn.example.com/products/image.webp",
      };
    },
  });

  const denied = await handler(
    apiEvent("POST", {
      routeKey: "POST /uploads",
      body: { contentType: "image/webp", size: 1_024 },
    }),
  );
  const allowed = await handler(
    apiEvent("POST", {
      routeKey: "POST /uploads",
      claims: adminClaims(),
      body: { contentType: "image/webp", size: 1_024 },
    }),
  );

  assert.equal(denied.statusCode, 401);
  assert.equal(allowed.statusCode, 201);
  assert.deepEqual(received, { contentType: "image/webp", size: 1_024 });
  assert.equal(
    responseBody(allowed).assetUrl,
    "https://cdn.example.com/products/image.webp",
  );
});

test("updates an existing product and reports a missing product", async () => {
  const existing = createTestHandler();
  const missing = createTestHandler({ update: async () => null });
  const event = apiEvent("PUT", {
    id: "product-123",
    claims: adminClaims(),
    body: validProduct,
  });

  const updatedResponse = await existing.handler(event);
  const missingResponse = await missing.handler(event);

  assert.equal(updatedResponse.statusCode, 200);
  assert.equal(responseBody(updatedResponse).id, "product-123");
  assert.equal(missingResponse.statusCode, 404);
});

test("deletes a product only for an administrator", async () => {
  const { handler } = createTestHandler();
  const response = await handler(
    apiEvent("DELETE", { id: "product-123", claims: adminClaims() }),
  );

  assert.equal(response.statusCode, 204);
  assert.equal(response.body, undefined);
});

test("returns a generic response for an unexpected dependency failure", async () => {
  const { handler, logs } = createTestHandler({
    list: async () => {
      throw new Error("internal database detail");
    },
  });

  const response = await handler(apiEvent("GET"));
  const body = responseBody(response);

  assert.equal(response.statusCode, 500);
  assert.equal(body.error.code, "INTERNAL_ERROR");
  assert.equal(JSON.stringify(body).includes("database detail"), false);
  assert.equal(logs.error.length, 1);
});
