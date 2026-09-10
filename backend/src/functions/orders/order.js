import { RequestValidationError } from "../../shared/http.js";

const BODY_FIELDS = new Set(["address", "items", "paymentMethod"]);
const ADDRESS_FIELDS = new Set([
  "firstName",
  "lastName",
  "email",
  "phone",
  "street",
  "city",
  "state",
  "zip",
  "country",
]);
const ITEM_FIELDS = new Set(["id", "size", "quantity"]);

function rejectUnexpectedFields(value, allowedFields, path, details) {
  if (!value || Array.isArray(value) || typeof value !== "object") return;
  for (const field of Object.keys(value)) {
    if (!allowedFields.has(field)) {
      details.push({ field: `${path}${field}`, message: "is not allowed" });
    }
  }
}

function cleanText(value, field, minimum, maximum, details) {
  const cleaned = typeof value === "string" ? value.trim() : "";
  if (cleaned.length < minimum || cleaned.length > maximum) {
    details.push({
      field,
      message: `must contain between ${minimum} and ${maximum} characters`,
    });
  } else if (/\p{Cc}/u.test(cleaned)) {
    details.push({ field, message: "must not contain control characters" });
  }
  return cleaned;
}

function validateAddress(value, details) {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    details.push({ field: "address", message: "must be an object" });
    return {};
  }

  rejectUnexpectedFields(value, ADDRESS_FIELDS, "address.", details);
  const address = {
    firstName: cleanText(value.firstName, "address.firstName", 1, 80, details),
    lastName: cleanText(value.lastName, "address.lastName", 1, 80, details),
    email: cleanText(value.email, "address.email", 3, 254, details).toLowerCase(),
    phone: cleanText(value.phone, "address.phone", 7, 20, details),
    street: cleanText(value.street, "address.street", 3, 200, details),
    city: cleanText(value.city, "address.city", 1, 100, details),
    state: cleanText(value.state, "address.state", 1, 100, details),
    zip: cleanText(value.zip, "address.zip", 1, 20, details),
    country: cleanText(value.country, "address.country", 2, 80, details),
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
    details.push({ field: "address.email", message: "must be a valid email" });
  }
  if (!/^\+?[0-9]{7,20}$/.test(address.phone)) {
    details.push({
      field: "address.phone",
      message: "must contain 7 to 20 digits with an optional leading plus",
    });
  }
  return address;
}

function validateItems(value, details) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 50) {
    details.push({ field: "items", message: "must contain between 1 and 50 items" });
    return [];
  }

  const combined = new Map();
  value.forEach((item, index) => {
    const path = `items[${index}]`;
    if (!item || Array.isArray(item) || typeof item !== "object") {
      details.push({ field: path, message: "must be an object" });
      return;
    }

    rejectUnexpectedFields(item, ITEM_FIELDS, `${path}.`, details);
    const id = typeof item.id === "string" ? item.id.trim() : "";
    const size = typeof item.size === "string" ? item.size.trim() : "";
    const quantity = item.quantity;

    if (!/^[A-Za-z0-9_-]{1,100}$/.test(id)) {
      details.push({ field: `${path}.id`, message: "has an invalid format" });
    }
    if (size.length === 0 || size.length > 20 || /\p{Cc}/u.test(size)) {
      details.push({ field: `${path}.size`, message: "has an invalid format" });
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      details.push({
        field: `${path}.quantity`,
        message: "must be an integer from 1 to 10",
      });
    }

    if (id && size && Number.isInteger(quantity)) {
      const key = `${id}\u0000${size}`;
      const previous = combined.get(key);
      const totalQuantity = (previous?.quantity || 0) + quantity;
      if (totalQuantity > 10) {
        details.push({
          field: `${path}.quantity`,
          message: "combined quantity must not exceed 10",
        });
      } else {
        combined.set(key, { id, size, quantity: totalQuantity });
      }
    }
  });

  return [...combined.values()];
}

export function validateOrderPayload(input) {
  const details = [];
  rejectUnexpectedFields(input, BODY_FIELDS, "", details);
  const address = validateAddress(input.address, details);
  const items = validateItems(input.items, details);

  if (input.paymentMethod !== "cod") {
    details.push({
      field: "paymentMethod",
      message: "must be cod until an online payment provider is integrated",
    });
  }

  if (details.length > 0) {
    throw new RequestValidationError("Order validation failed.", details);
  }
  return { address, items, paymentMethod: "cod" };
}

function priceToMinorUnits(price, productId) {
  if (!Number.isFinite(price) || price < 0 || price > 1_000_000) {
    throw new Error(`Product ${productId} has an invalid catalog price.`);
  }
  return Math.round(price * 100);
}

export function buildOrder({
  input,
  products,
  userId,
  orderId,
  createdAt,
  deliveryFeeMinor,
  currency,
}) {
  const details = [];
  const productsById = new Map(products.map((product) => [product.id, product]));

  const items = input.items.map((requestedItem, index) => {
    const product = productsById.get(requestedItem.id);
    if (!product) {
      details.push({
        field: `items[${index}].id`,
        message: "product is unavailable",
      });
      return null;
    }
    if (!Array.isArray(product.sizes) || !product.sizes.includes(requestedItem.size)) {
      details.push({
        field: `items[${index}].size`,
        message: "size is unavailable",
      });
      return null;
    }

    const unitPriceMinor = priceToMinorUnits(Number(product.price), product.id);
    return {
      productId: product.id,
      name: String(product.name || "Product"),
      size: requestedItem.size,
      quantity: requestedItem.quantity,
      unitPriceMinor,
      lineTotalMinor: unitPriceMinor * requestedItem.quantity,
    };
  });

  if (details.length > 0) {
    throw new RequestValidationError("Some order items are unavailable.", details);
  }

  const subtotalMinor = items.reduce(
    (total, item) => total + item.lineTotalMinor,
    0,
  );
  return {
    userId,
    orderId,
    address: input.address,
    items,
    subtotalMinor,
    deliveryFeeMinor,
    totalMinor: subtotalMinor + deliveryFeeMinor,
    currency,
    paymentMethod: "cod",
    paymentStatus: "pending",
    orderStatus: "placed",
    createdAt,
  };
}

export function orderReceipt(order) {
  return {
    orderId: order.orderId,
    itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
    subtotalMinor: order.subtotalMinor,
    deliveryFeeMinor: order.deliveryFeeMinor,
    totalMinor: order.totalMinor,
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    orderStatus: order.orderStatus,
    createdAt: order.createdAt,
  };
}
