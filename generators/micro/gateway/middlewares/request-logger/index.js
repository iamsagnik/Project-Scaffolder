async function realistic(ctx = {}) {
  const content = `export function requestLogger(req, _res, next) {
  console.log(\`\${req.method} \${req.originalUrl}\`);
  next();
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `export function requestLogger(req, _res, next) { next(); }`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `import { logger } from "../../shared/logger/logger";

export function requestLogger(req, _res, next) {
  logger.info({ method: req.method, url: req.originalUrl, headers: req.headers });
  next();
}
`;
  return { type: "single", content };
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  default: defaultVariant
};
