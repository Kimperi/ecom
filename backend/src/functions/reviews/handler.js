import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { createReviewsHandler } from "./application.js";
import { createReviewsRepository } from "./repository.js";

const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});

const repository = createReviewsRepository({
  documentClient,
  productsTableName: process.env.PRODUCTS_TABLE_NAME,
  reviewsTableName: process.env.REVIEWS_TABLE_NAME,
});

export const handler = createReviewsHandler({ repository });
