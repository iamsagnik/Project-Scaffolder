async function realistic(ctx = {}) {
  const content = `import express from "express";
import routes from "./routes";

export function createServer() {
  const app = express();
  app.use(express.json());
  app.use("/", routes);
  app.get("/health", (_req, res) => res.json({ ok: true }));
  return app;
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `export const createServer = () => ({ listen: () => {} });`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `import express from "express";
import helmet from "helmet";
import cors from "cors";
import routes from "./routes";
import { logger } from "../../shared/logger/logger";

export function createServer() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use((req, _res, next) => {
    logger.info(\`Request: \${req.method} \${req.url}\`);
    next();
  });
  app.use("/", routes);
  return app;
}
`;
  return { type: "single", content };
}

/* Standard: express */
async function express(ctx = {}) {
  return realistic(ctx);
}

/* Service variants */
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
  express,
  users,
  orders,
  default: defaultVariant
};
