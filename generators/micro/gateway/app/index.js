async function realistic(ctx = {}) {
  const content = `import express from "express";
import routes from "./routes.config";

export function createServer() {
  const app = express();
  app.use(express.json());
  app.use("/api", routes);
  app.get("/health", (_, res) => res.json({ status: "ok" }));
  return app;
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `export const createServer = () => ({
  listen: () => console.log("started")
});
`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `import express from "express";
import helmet from "helmet";
import cors from "cors";
import routes from "./routes.config";
import { requestLogger } from "./middlewares/request-logger.middleware";

export function createServer() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);
  app.use("/api", routes);
  app.get("/health", (_, res) => res.json({ ok: true }));
  return app;
}
`;
  return { type: "single", content };
}

/* template-specific standard */
async function express(ctx = {}) {
  return realistic(ctx);
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  express,
  default: defaultVariant
};
