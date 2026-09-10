import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SESv2Client } from "@aws-sdk/client-sesv2";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { createOrdersHandler } from "./application.js";
import { createOrderNotifier } from "./notifier.js";
import { createOrdersRepository } from "./repository.js";

function requiredNonNegativeInteger(value, name) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer.`);
  }
  return parsed;
}

function requiredCurrency(value) {
  if (typeof value !== "string" || !/^[A-Z]{3}$/.test(value)) {
    throw new Error("ORDER_CURRENCY must be a three-letter uppercase code.");
  }
  return value;
}

const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});

const repository = createOrdersRepository({
  documentClient,
  productsTableName: process.env.PRODUCTS_TABLE_NAME,
  ordersTableName: process.env.ORDERS_TABLE_NAME,
});
const notifier = createOrderNotifier({
  sesClient: new SESv2Client({}),
  sourceEmail: process.env.SES_SOURCE_EMAIL,
  sellerEmail: process.env.SELLER_NOTIFICATION_EMAIL,
});

export const handler = createOrdersHandler({
  repository,
  notifier,
  deliveryFeeMinor: requiredNonNegativeInteger(
    process.env.DELIVERY_FEE_MINOR,
    "DELIVERY_FEE_MINOR",
  ),
  currency: requiredCurrency(process.env.ORDER_CURRENCY),
});
