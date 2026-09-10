import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { createProductsHandler } from "./application.js";
import { createProductsRepository } from "./repository.js";

const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});

const repository = createProductsRepository({
  documentClient,
  tableName: process.env.PRODUCTS_TABLE_NAME,
});

export const handler = createProductsHandler({ repository });
