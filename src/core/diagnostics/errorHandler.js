const logger = require("./logger");

function buildErrorResponse(type, code, message, options = {}) {
  return {
    status: "error",
    type,
    code,
    message,
    filePath: options.filePath || null,
    severity: options.severity || "error",
    timestamp: new Date().toISOString(),
    stack: options.stack || null,
    module: options.module || null    
  };
}

function normalizeErrorResponse(rawError, context = {}) {
  if (rawError && rawError.code && rawError.message && rawError.severity) {
    return {
      ...rawError,
      filePath: rawError.filePath || context.filePath || null,
      module: rawError.module || context.module || null,
      timestamp: rawError.timestamp || new Date().toISOString()
    };
  }

  if (rawError instanceof Error) {
    return buildErrorResponse(
      "exception",
      "UNHANDLED_EXCEPTION",
      rawError.message,      
      {
      severity: "critical",
      filePath: context.filePath,
      module: context.module,
      stack: rawError.stack
    });
  }

  if (typeof rawError === "string") {
    return buildErrorResponse(
      "string",
      "STRING_ERROR",
      rawError,      
      {
      severity: "error",
      filePath: context.filePath,
      module: context.module,
    });
  }

  if (typeof rawError === "object" && rawError !== null) {
    return buildErrorResponse(
      "object",
      rawError.code || "OBJECT_ERROR",
      rawError.message || "Unknown object error",
      {
        severity: rawError.severity || "error",
        filePath: rawError.filePath || context.filePath || null,
        module: rawError.module || context.module || null,
        stack: rawError.stack
      }
    );
  }

  return buildErrorResponse(
    "unknown",
    "UNKNOWN_THROWABLE",
    "Unknown throwable encountered",
    {
      severity: "critical",
      filePath: context.filePath,
      module: context.module
    }
  );
}


async function wrap(fn, context = {}) {
  try {
    const value = await fn();

    if (value?.ok === false) {
      return { ok: false, value };
    }
    return { ok: true, value };
  } catch (err) {
    const structured = normalizeErrorResponse(err, context);
    logger.error(context.module || "unknown", structured.message, structured);
    return { ok: false, error: structured };
  }
}

function throwError(errorObject) {
  logger.error(
    errorObject.module || "unknown",
    errorObject.message,
    errorObject
  );
  throw errorObject;
}

module.exports = { 
  buildErrorResponse, 
  normalizeErrorResponse, 
  wrap, 
  throwError
};