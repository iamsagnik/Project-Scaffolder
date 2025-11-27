const logger = require("./logger");

function buildErrorResponse(type, code, message, options = {}) {
  return {
    status: "error",
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
  if (rawError && rawError.code && rawError.message && rawError.severity) {
    return {
      ...rawError,
      filePath: rawError.filePath || context.filePath || null,
      module: rawError.module || context.module || null,
      time: rawError.time || new Date().toISOString()
    };
  }

  if (rawError instanceof Error) {
    return buildErrorResponse({
      code: "UNHANDLED_EXCEPTION",
      message: rawError.message,
      severity: "critical",
      filePath: context.filePath,
      module: context.module,
      stack: rawError.stack
    });
  }

  if (typeof rawError === "string") {
    return buildErrorResponse({
      code: "STRING_ERROR",
      message: rawError,
      severity: "error",
      filePath: context.filePath,
      module: context.module
    });
  }

  if (typeof rawError === "object") {
    return buildErrorResponse({
      code: rawError.code || "OBJECT_ERROR",
      message: rawError.message || "Unknown object error",
      severity: rawError.severity || "error",
      filePath: rawError.filePath || context.filePath || null,
      module: rawError.module || context.module || null,
      stack: rawError.stack
    });
  }

  return buildErrorResponse({
    code: "UNKNOWN_THROWABLE",
    message: "Unknown throwable encountered",
    severity: "critical",
    filePath: context.filePath,
    module: context.module
  });
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