import assert from "node:assert/strict";
import test from "node:test";
import {
  createMediaUploadService,
  MAX_MEDIA_BYTES,
  validateMediaUploadRequest,
} from "../src/functions/products/media.js";

test("rejects unsupported media and oversized files", () => {
  assert.throws(
    () => validateMediaUploadRequest({ contentType: "image/svg+xml", size: 10 }),
    /validation failed/i,
  );
  assert.throws(
    () =>
      validateMediaUploadRequest({
        contentType: "image/jpeg",
        size: MAX_MEDIA_BYTES + 1,
      }),
    /validation failed/i,
  );
});

test("creates a short-lived and size-limited presigned upload", async () => {
  let request;
  const service = createMediaUploadService({
    s3Client: {},
    bucketName: "private-media-bucket",
    cdnBaseUrl: "https://cdn.example.com/",
    createId: () => "fixed-id",
    createPresignedPostFn: async (_client, input) => {
      request = input;
      return { url: "https://upload.example.com", fields: { key: input.Key } };
    },
  });

  const result = await service.createUpload({
    contentType: "image/webp",
    size: 2_048,
  });

  assert.equal(request.Bucket, "private-media-bucket");
  assert.equal(request.Key, "products/fixed-id.webp");
  assert.equal(request.Expires, 300);
  assert.deepEqual(request.Conditions[0], [
    "content-length-range",
    1,
    MAX_MEDIA_BYTES,
  ]);
  assert.equal(
    result.assetUrl,
    "https://cdn.example.com/products/fixed-id.webp",
  );
});
