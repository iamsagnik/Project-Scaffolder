const logger = require("./logger");
const stats = require("./statsCollector");

let warnings = [];

function createWarningResponse(type, code, message, options = {}) {
  stats.incrementWarnings();
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
    logger.info("warningsCollector", warning.message, { warning });
  } else {
    logger.warn("warningsCollector", warning.message, { warning });
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