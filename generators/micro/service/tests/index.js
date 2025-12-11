async function realistic(ctx = {}) {
  const service = ctx.variant || "service";

  const content = `import { createServer } from "./app";

const port = process.env.PORT || 3000;
const server = createServer();

server.listen(port, () => {
  console.log("${service} service running on port", port);
});
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const service = ctx.variant || "service";
  const content = `console.log("${service} service running");`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const service = ctx.variant || "service";
  const content = `import { createServer } from "./app";
import { logger } from "../../shared/logger/logger";

const port = process.env.PORT || 3000;
const server = createServer();

server.listen(port, () => {
  logger.info("${service} service listening on port " + port);
});
`;
  return { type: "single", content };
}

async function users(ctx = {}) {
  return realistic({ ...ctx, variant: "users" });
}

async function orders(ctx = {}) {
  return realistic({ ...ctx, variant: "orders" });
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  users,
  orders,
  default: defaultVariant
};
