export function logRequest(logger, eventName, metadata = {}) {
  logger.info(
    JSON.stringify({
      level: "INFO",
      event: eventName,
      ...metadata,
    }),
  );
}

export function logFailure(logger, eventName, error, metadata = {}) {
  logger.error(
    JSON.stringify({
      level: "ERROR",
      event: eventName,
      errorName: error?.name || "Error",
      errorMessage: error?.message || "Unknown error",
      ...metadata,
    }),
  );
}
