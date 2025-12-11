async function realistic(ctx = {}) {
  const content = `import { Router } from "express";
const router = Router();

// Example proxy route placeholder
router.get("/", (req, res) => {
  res.json({ message: "Proxy endpoint - configure upstreams" });
});

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
import { createProxyMiddleware } from "http-proxy-middleware";
const router = Router();

// Example: proxy user service
router.use("/users", createProxyMiddleware({ target: "http://users-service:3000", changeOrigin: true }));

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
