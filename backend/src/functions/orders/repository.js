import { BatchGetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { ConflictError } from "../../shared/http.js";

export function createOrdersRepository({
  documentClient,
  productsTableName,
  ordersTableName,
}) {
  if (!documentClient?.send) {
    throw new Error("A DynamoDB document client is required.");
  }
  if (!productsTableName) throw new Error("PRODUCTS_TABLE_NAME is required.");
  if (!ordersTableName) throw new Error("ORDERS_TABLE_NAME is required.");

  return {
    async getProducts(productIds) {
      const result = await documentClient.send(
        new BatchGetCommand({
          RequestItems: {
            [productsTableName]: {
              Keys: productIds.map((id) => ({ id })),
              ProjectionExpression: "id, #name, price, sizes",
              ExpressionAttributeNames: { "#name": "name" },
            },
          },
        }),
      );
      const unprocessed = result.UnprocessedKeys?.[productsTableName]?.Keys || [];
      if (unprocessed.length > 0) {
        throw new Error("DynamoDB did not process every requested product.");
      }
      return result.Responses?.[productsTableName] || [];
    },

    async create(order) {
      try {
        await documentClient.send(
          new PutCommand({
            TableName: ordersTableName,
            Item: order,
            ConditionExpression:
              "attribute_not_exists(userId) AND attribute_not_exists(orderId)",
          }),
        );
        return order;
      } catch (error) {
        if (error?.name === "ConditionalCheckFailedException") {
          throw new ConflictError("The order identifier already exists.");
        }
        throw error;
      }
    },
  };
}
