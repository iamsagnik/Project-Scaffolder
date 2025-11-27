const logger = require("./logger");

let successEvents = [];

function createSuccessResponse(type, code, message, options = {}) {
  return {
    status: "success",
    type,
    code,
    message,
    filePath: options.filePath || null,
    meta: options.meta || null,
    timestamp: new Date().toISOString()
  };
}

function recordSuccessEvents(successEvent) {
  successEvents.push(successEvent);
  logger.info(successEvent.message, successEvent, successEvent.type);
}

function getAllSuccessEvents() {
  return successEvents;
}

function clearAllSuccesses() {
  successEvents = [];
}

module.exports = {
  createSuccessResponse,
  recordSuccessEvents,
  getAllSuccessEvents,
  clearAllSuccesses
};