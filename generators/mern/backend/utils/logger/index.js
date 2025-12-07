// generators/mern/backend/util/logger.js

async function winstonVariant(ctx = {}) {
  const content = `// src/utils/logger.js
const logger = require('../config/logger');
module.exports = logger;
`;

  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return winstonVariant(ctx);
}

module.exports = {
  winston: winstonVariant,
  default: defaultVariant,
};
