const logger = require("./logger");

let warnings = [];

function createWarningResponse(type, code, message, options = {}) {
  return {
    status: "warning",
    type,
    code,
    message,
    filePath: options.filePath || null,
    meta: options.meta || null,
    severity: options.severity || "warn",
    timestamp: new Date().toISOString()
  };
}

function recordWarning(warning) {
  warnings.push(warning);

  if (warning.severity === "info") {
    logger.info(warning.message, warning, warning.type);
  } else {
    logger.warn(warning.message, warning, warning.type);
  }
}

function getAllWarnings() {
  return warnings;
}

function clearWarnings() {
  warnings = [];
}

module.exports = {
  createWarningResponse,
  recordWarning,
  getAllWarnings,
  clearWarnings
};