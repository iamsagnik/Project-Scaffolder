async function realistic(ctx = {}) {
  const content = `import { Router } from "express";
import proxyRoutes from "./routes/proxy.routes";
import healthRoutes from "./routes/health.routes";

const router = Router();
router.use("/proxy", proxyRoutes);
router.use("/health", healthRoutes);

export default router;
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `export default {};`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `import { Router } from "express";
import proxyRoutes from "./routes/proxy.routes";
import healthRoutes from "./routes/health.routes";
import { requestLogger } from "./middlewares/request-logger.middleware";

const router = Router();
router.use(requestLogger);
router.use("/proxy", proxyRoutes);
router.use("/health", healthRoutes);

export default router;
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
