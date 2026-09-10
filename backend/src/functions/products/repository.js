import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

function conditionalFailure(error) {
  return error?.name === "ConditionalCheckFailedException";
}

export function createProductsRepository({ documentClient, tableName }) {
  if (!documentClient?.send) throw new Error("A DynamoDB document client is required.");
  if (typeof tableName !== "string" || tableName.trim() === "") {
    throw new Error("PRODUCTS_TABLE_NAME is required.");
  }

  return {
    async list() {
      const items = [];
      let exclusiveStartKey;

      do {
        const result = await documentClient.send(
          new ScanCommand({
            TableName: tableName,
            ExclusiveStartKey: exclusiveStartKey,
          }),
        );
        items.push(...(result.Items || []));
        exclusiveStartKey = result.LastEvaluatedKey;
      } while (exclusiveStartKey);

      return items.sort((left, right) => Number(right.date) - Number(left.date));
    },

    async get(id) {
      const result = await documentClient.send(
        new GetCommand({ TableName: tableName, Key: { id } }),
      );
      return result.Item || null;
    },

    async create(product) {
      await documentClient.send(
        new PutCommand({
          TableName: tableName,
          Item: product,
          ConditionExpression: "attribute_not_exists(id)",
        }),
      );
      return product;
    },

    async update(id, product) {
      try {
        const result = await documentClient.send(
          new UpdateCommand({
            TableName: tableName,
            Key: { id },
            ConditionExpression: "attribute_exists(id)",
            UpdateExpression:
              "SET #name = :name, #description = :description, #price = :price, #image = :image, #category = :category, #subCategory = :subCategory, #sizes = :sizes, #bestseller = :bestseller, #updatedAt = :updatedAt",
            ExpressionAttributeNames: {
              "#name": "name",
              "#description": "description",
              "#price": "price",
              "#image": "image",
              "#category": "category",
              "#subCategory": "subCategory",
              "#sizes": "sizes",
              "#bestseller": "bestseller",
              "#updatedAt": "updatedAt",
            },
            ExpressionAttributeValues: {
              ":name": product.name,
              ":description": product.description,
              ":price": product.price,
              ":image": product.image,
              ":category": product.category,
              ":subCategory": product.subCategory,
              ":sizes": product.sizes,
              ":bestseller": product.bestseller,
              ":updatedAt": product.updatedAt,
            },
            ReturnValues: "ALL_NEW",
          }),
        );
        return result.Attributes || null;
      } catch (error) {
        if (conditionalFailure(error)) return null;
        throw error;
      }
    },

    async delete(id) {
      try {
        const result = await documentClient.send(
          new DeleteCommand({
            TableName: tableName,
            Key: { id },
            ConditionExpression: "attribute_exists(id)",
            ReturnValues: "ALL_OLD",
          }),
        );
        return result.Attributes || null;
      } catch (error) {
        if (conditionalFailure(error)) return null;
        throw error;
      }
    },
  };
}
