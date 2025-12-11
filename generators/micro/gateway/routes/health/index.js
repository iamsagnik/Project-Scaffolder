async function realistic(ctx = {}) {
  const content = `import { Router } from "express";
const router = Router();

router.get("/", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

export default router;
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `export default (req, res) => res.json({ status: "ok" });`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `import { Router } from "express";
import { getServiceHealth } from "../../helpers/health"; // optional helper
const router = Router();

router.get("/", async (_req, res) => {
  const health = await getServiceHealth();
  res.json({ status: "ok", details: health });
});

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
