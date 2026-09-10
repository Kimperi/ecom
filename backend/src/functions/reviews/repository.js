import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ConflictError } from "../../shared/http.js";

export function createReviewsRepository({
  documentClient,
  productsTableName,
  reviewsTableName,
}) {
  if (!documentClient?.send) {
    throw new Error("A DynamoDB document client is required.");
  }
  if (typeof productsTableName !== "string" || productsTableName.trim() === "") {
    throw new Error("PRODUCTS_TABLE_NAME is required.");
  }
  if (typeof reviewsTableName !== "string" || reviewsTableName.trim() === "") {
    throw new Error("REVIEWS_TABLE_NAME is required.");
  }

  return {
    async list(productId) {
      const result = await documentClient.send(
        new QueryCommand({
          TableName: reviewsTableName,
          KeyConditionExpression: "#productId = :productId",
          ExpressionAttributeNames: { "#productId": "productId" },
          ExpressionAttributeValues: { ":productId": productId },
        }),
      );
      return (result.Items || []).sort((left, right) =>
        String(right.createdAt).localeCompare(String(left.createdAt)),
      );
    },

    async productExists(productId) {
      const result = await documentClient.send(
        new GetCommand({
          TableName: productsTableName,
          Key: { id: productId },
          ProjectionExpression: "id",
        }),
      );
      return Boolean(result.Item);
    },

    async create(review) {
      try {
        await documentClient.send(
          new PutCommand({
            TableName: reviewsTableName,
            Item: review,
            ConditionExpression:
              "attribute_not_exists(productId) AND attribute_not_exists(userId)",
          }),
        );
        return review;
      } catch (error) {
        if (error?.name === "ConditionalCheckFailedException") {
          throw new ConflictError("You have already reviewed this product.");
        }
        throw error;
      }
    },
  };
}
