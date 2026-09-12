import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { createProductsHandler } from "./application.js";
import { createMediaUploadService } from "./media.js";
import { createProductsRepository } from "./repository.js";

const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});

const repository = createProductsRepository({
  documentClient,
  tableName: process.env.PRODUCTS_TABLE_NAME,
});

const media = createMediaUploadService({
  s3Client: new S3Client({}),
  bucketName: process.env.MEDIA_BUCKET_NAME,
  cdnBaseUrl: process.env.MEDIA_CDN_BASE_URL,
});

export const handler = createProductsHandler({ repository, media });
