import { randomUUID } from "node:crypto";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { RequestValidationError } from "../../shared/http.js";

export const MAX_MEDIA_BYTES = 5 * 1024 * 1024;
export const MEDIA_UPLOAD_EXPIRY_SECONDS = 300;

const CACHE_CONTROL = "public, max-age=31536000, immutable";
const EXTENSIONS_BY_CONTENT_TYPE = Object.freeze({
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
});
const ALLOWED_FIELDS = new Set(["contentType", "size"]);

export function validateMediaUploadRequest(input) {
  const issues = [];

  for (const field of Object.keys(input)) {
    if (!ALLOWED_FIELDS.has(field)) {
      issues.push({ field, message: "is not allowed" });
    }
  }

  const contentType = input.contentType;
  if (!Object.hasOwn(EXTENSIONS_BY_CONTENT_TYPE, contentType)) {
    issues.push({
      field: "contentType",
      message: "must be image/jpeg, image/png, or image/webp",
    });
  }

  const size = input.size;
  if (!Number.isInteger(size) || size < 1 || size > MAX_MEDIA_BYTES) {
    issues.push({
      field: "size",
      message: `must be an integer between 1 and ${MAX_MEDIA_BYTES}`,
    });
  }

  if (issues.length > 0) {
    throw new RequestValidationError("Media upload validation failed.", issues);
  }

  return { contentType, size };
}

export function createMediaUploadService({
  s3Client,
  bucketName,
  cdnBaseUrl,
  createId = randomUUID,
  createPresignedPostFn = createPresignedPost,
}) {
  if (!s3Client) throw new Error("An S3 client is required.");
  if (!bucketName) throw new Error("A media bucket name is required.");

  let normalizedCdnBaseUrl;
  try {
    const url = new URL(cdnBaseUrl);
    if (url.protocol !== "https:" || url.username || url.password) {
      throw new Error("Unsafe CDN URL");
    }
    normalizedCdnBaseUrl = url.toString().replace(/\/$/, "");
  } catch {
    throw new Error("A valid HTTPS media CDN base URL is required.");
  }

  return {
    async createUpload(input) {
      const { contentType } = validateMediaUploadRequest(input);
      const extension = EXTENSIONS_BY_CONTENT_TYPE[contentType];
      const key = `products/${createId()}.${extension}`;

      const presignedPost = await createPresignedPostFn(s3Client, {
        Bucket: bucketName,
        Key: key,
        Fields: {
          "Content-Type": contentType,
          "Cache-Control": CACHE_CONTROL,
        },
        Conditions: [
          ["content-length-range", 1, MAX_MEDIA_BYTES],
          ["eq", "$Content-Type", contentType],
          ["eq", "$Cache-Control", CACHE_CONTROL],
        ],
        Expires: MEDIA_UPLOAD_EXPIRY_SECONDS,
      });

      return {
        uploadUrl: presignedPost.url,
        fields: presignedPost.fields,
        assetUrl: `${normalizedCdnBaseUrl}/${key}`,
        expiresIn: MEDIA_UPLOAD_EXPIRY_SECONDS,
        maxBytes: MAX_MEDIA_BYTES,
      };
    },
  };
}
