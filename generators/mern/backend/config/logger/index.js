// generators/mern/backend/config/logger.js

async function winstonVariant(ctx = {}) {
  const content = `// src/config/logger.js
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message, ...meta }) => {
      return \`\${timestamp} [\${level}] \${message} \${Object.keys(meta).length ? JSON.stringify(meta) : ""}\`;
    })
  ),
  transports: [new transports.Console()]
});

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