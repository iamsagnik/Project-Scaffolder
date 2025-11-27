const logger = require("./logger");

function buildErrorResponse(type, code, message, options = {}) {
  return {
    type,
    code,
    message,
    details: options.details || null,
    filePath: options.filePath || null,
    suggestion: options.suggestion || null,
    severity: options.severity || "error",
    timestamp: new Date().toISOString()
  };
}

function normalizeErrorResponse(rawError, context = {}) {
  if (rawError && rawError.type && rawError.message) {
    return rawError;
  }

  let message = "Unknown system error";
  let details = null;

  if (rawError instanceof Error) {
    message = rawError.message;
    details = rawError.stack;
  } else if (typeof rawError === "string") {
    message = rawError;
  } else if (typeof rawError === "object") {
    message = rawError.message || message;
    details = rawError.details || rawError.stack || null;
  }

  return buildErrorResponse(
    "SystemError",
    "UNKNOWN_ERROR",
    message,
    {
      details,
      filePath: context.filePath,
      suggestion: "Enable debug mode for full trace",
      severity: "critical"
    }
  );
}

async function wrap(fn, context = {}) {
  try {
    return await fn();
  } catch (err) {
    const normalized = normalizeErrorResponse(err, context);
    logger.error(normalized.message, normalized, context.module || "unknown");
    throw normalized;
  }
}

function throwError(errorObject) {
  logger.error(
    errorObject.message,
    errorObject,
    errorObject.type || "unknown"
  );
  throw errorObject;
}

module.exports = { 
  buildErrorResponse, 
  normalizeErrorResponse, 
  wrap, 
  throwError
};