import assert from "node:assert/strict";
import test from "node:test";
import { createOrdersHandler } from "../src/functions/orders/application.js";
import { ConflictError } from "../src/shared/http.js";

const FIXED_DATE = new Date("2026-09-10T10:00:00.000Z");
const validAddress = Object.freeze({
  firstName: "Badr",
  lastName: "Example",
  email: "buyer@example.test",
  phone: "+212600000000",
  street: "1 Cloud Street",
  city: "Fes",
  state: "Fes-Meknes",
  zip: "30000",
  country: "Morocco",
});
const validInput = Object.freeze({
  address: validAddress,
  items: [{ id: "product-1", size: "M", quantity: 1 }],
  paymentMethod: "cod",
});

function apiEvent(method, { body, claims } = {}) {
  const event = {
    requestContext: {
      requestId: "request-789",
      http: { method },
    },
  };
  if (body !== undefined) event.body = JSON.stringify(body);
  if (claims) event.requestContext.authorizer = { jwt: { claims } };
  return event;
}

function createTestHandler(repositoryOverrides = {}, notifierOverrides = {}) {
  const repository = {
    getProducts: async () => [
      { id: "product-1", name: "Cloud Hoodie", price: 499.95, sizes: ["M"] },
    ],
    create: async (order) => order,
    ...repositoryOverrides,
  };
  const notifier = {
    send: async () => undefined,
    ...notifierOverrides,
  };
  const logs = { info: [], error: [] };
  const logger = {
    info: (entry) => logs.info.push(entry),
    error: (entry) => logs.error.push(entry),
  };

  return {
    handler: createOrdersHandler({
      repository,
      notifier,
      deliveryFeeMinor: 5_000,
      currency: "MAD",
      clock: () => FIXED_DATE,
      createId: () => "order-789",
      logger,
    }),
    logs,
  };
}

function responseBody(response) {
  return response.body ? JSON.parse(response.body) : undefined;
}

test("allows only POST on the order endpoint", async () => {
  const { handler } = createTestHandler();
  const response = await handler(apiEvent("GET"));

  assert.equal(response.statusCode, 405);
  assert.equal(responseBody(response).error.code, "METHOD_NOT_ALLOWED");
});

test("requires a Cognito identity before processing the cart", async () => {
  let productsCalled = false;
  const { handler } = createTestHandler({
    getProducts: async () => {
      productsCalled = true;
      return [];
    },
  });

  const response = await handler(apiEvent("POST", { body: validInput }));

  assert.equal(response.statusCode, 401);
  assert.equal(productsCalled, false);
});

test("rejects totals, identity, unsupported payment and invalid fields", async () => {
  let createCalled = false;
  const { handler } = createTestHandler({
    create: async () => {
      createCalled = true;
    },
  });
  const response = await handler(
    apiEvent("POST", {
      claims: { sub: "user-789" },
      body: {
        ...validInput,
        total: 1,
        userId: "chosen-by-browser",
        paymentMethod: "stripe",
        address: { ...validAddress, phone: "short", admin: true },
        items: [
          {
            id: "product-1",
            size: "M",
            quantity: 99,
            price: 0.01,
          },
        ],
      },
    }),
  );

  assert.equal(response.statusCode, 400);
  assert.equal(createCalled, false);
  const fields = responseBody(response).error.details.map(({ field }) => field);
  assert.ok(fields.includes("total"));
  assert.ok(fields.includes("userId"));
  assert.ok(fields.includes("paymentMethod"));
  assert.ok(fields.includes("address.admin"));
  assert.ok(fields.includes("address.phone"));
  assert.ok(fields.includes("items[0].price"));
  assert.ok(fields.includes("items[0].quantity"));
});

test("rejects unavailable products and sizes", async () => {
  const { handler } = createTestHandler({
    getProducts: async () => [
      { id: "product-1", name: "Cloud Hoodie", price: 499.95, sizes: ["L"] },
    ],
  });
  const response = await handler(
    apiEvent("POST", {
      claims: { sub: "user-789" },
      body: {
        ...validInput,
        items: [
          { id: "product-1", size: "M", quantity: 1 },
          { id: "missing", size: "S", quantity: 1 },
        ],
      },
    }),
  );

  assert.equal(response.statusCode, 400);
  const fields = responseBody(response).error.details.map(({ field }) => field);
  assert.ok(fields.includes("items[0].size"));
  assert.ok(fields.includes("items[1].id"));
});

test("recalculates totals from DynamoDB and stores server-owned metadata", async () => {
  let requestedProductIds;
  let stored;
  let notified;
  const { handler, logs } = createTestHandler(
    {
      getProducts: async (ids) => {
        requestedProductIds = ids;
        return [
          {
            id: "product-1",
            name: "Cloud Hoodie",
            price: 499.95,
            sizes: ["M"],
          },
        ];
      },
      create: async (order) => {
        stored = order;
        return order;
      },
    },
    { send: async (order) => (notified = order) },
  );
  const response = await handler(
    apiEvent("POST", {
      claims: { sub: "user-789", email: "identity@example.test" },
      body: {
        ...validInput,
        items: [
          { id: "product-1", size: "M", quantity: 1 },
          { id: "product-1", size: "M", quantity: 2 },
        ],
      },
    }),
  );
  const receipt = responseBody(response);

  assert.equal(response.statusCode, 201);
  assert.deepEqual(requestedProductIds, ["product-1"]);
  assert.equal(stored.userId, "user-789");
  assert.equal(stored.orderId, "order-789");
  assert.equal(stored.items.length, 1);
  assert.equal(stored.items[0].quantity, 3);
  assert.equal(stored.items[0].unitPriceMinor, 49_995);
  assert.equal(stored.subtotalMinor, 149_985);
  assert.equal(stored.deliveryFeeMinor, 5_000);
  assert.equal(stored.totalMinor, 154_985);
  assert.equal(stored.createdAt, FIXED_DATE.toISOString());
  assert.equal(notified, stored);
  assert.equal(receipt.totalMinor, 154_985);
  assert.equal("address" in receipt, false);
  assert.equal(logs.info[0].includes("identity@example.test"), false);
});

test("returns a conflict when an order identifier already exists", async () => {
  const { handler } = createTestHandler({
    create: async () => {
      throw new ConflictError("The order identifier already exists.");
    },
  });
  const response = await handler(
    apiEvent("POST", {
      claims: { sub: "user-789" },
      body: validInput,
    }),
  );

  assert.equal(response.statusCode, 409);
  assert.equal(responseBody(response).error.code, "ORDER_CONFLICT");
});

test("keeps a stored order successful when the email notification fails", async () => {
  const { handler, logs } = createTestHandler(
    {},
    {
      send: async () => {
        throw new Error("private SES detail");
      },
    },
  );
  const response = await handler(
    apiEvent("POST", {
      claims: { sub: "user-789" },
      body: validInput,
    }),
  );

  assert.equal(response.statusCode, 201);
  assert.equal(logs.error.length, 1);
  assert.equal(logs.error[0].includes("order.notification_failed"), true);
});

test("hides unexpected database errors from the client", async () => {
  const { handler, logs } = createTestHandler({
    getProducts: async () => {
      throw new Error("private database detail");
    },
  });
  const response = await handler(
    apiEvent("POST", {
      claims: { sub: "user-789" },
      body: validInput,
    }),
  );
  const body = responseBody(response);

  assert.equal(response.statusCode, 500);
  assert.equal(body.error.code, "INTERNAL_ERROR");
  assert.equal(JSON.stringify(body).includes("database detail"), false);
  assert.equal(logs.error.length, 1);
});
