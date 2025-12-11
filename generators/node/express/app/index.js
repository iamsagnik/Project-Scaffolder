async function realistic(ctx = {}) {
  const content = `import express from "express";
import healthRoutes from "./routes/health";

export function createServer() {
  const app = express();
  app.use(express.json());
  app.use("/health", healthRoutes);
  return app;
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  return {
    type: "single",
    content: `export const createServer = () => ({ listen: () => {} });`
  };
}

async function enterprise(ctx = {}) {
  const content = `import express from "express";
import cors from "cors";
import helmet from "helmet";
import healthRoutes from "./routes/health";

export function createServer() {
  const app = express();
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use("/health", healthRoutes);
  return app;
}
`;
  return { type: "single", content };
}

/* variant: monorepo */
async function monorepo(ctx = {}) {
  return realistic(ctx);
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  monorepo,
  default: defaultVariant
};
