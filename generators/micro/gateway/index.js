async function realistic(ctx = {}) {
  const content = `import { createServer } from "./app";

const port = process.env.PORT || ${ctx.options?.port || 8080};
const server = createServer();

server.listen(port, () => {
  console.log("Gateway running on port", port);
});
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `console.log("gateway");`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `import { createServer } from "./app";
import { logger } from "../shared/logger/logger";

const port = process.env.PORT || ${ctx.options?.port || 8080};
const server = createServer();

server.listen(port, () => {
  logger.info(\`Gateway running on port \${port}\`);
});
`;
  return { type: "single", content };
}

/* default */
async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  default: defaultVariant
};
