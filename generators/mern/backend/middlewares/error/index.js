// generators/mern/backend/middleware/error.js

async function defaultVariant(ctx = {}) {
  const content = `// src/middlewares/error.middleware.js
const logger = require('../config/logger');

function errorHandler(err, req, res, next) {
  const message = err?.message || "Internal Server Error";
  logger.error(err.stack || err);

  return res.status(err.status || 500).json({
    error: message
  });
}

module.exports = { errorHandler };
`;
  return { type: "single", content };
}

module.exports = { default: defaultVariant };
