async function realistic(ctx = {}) {
  const content = `import { Router } from "express";
const router = Router();

router.get("/", (_req, res) => {
  res.json({ ok: true });
});

export default router;
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  return {
    type: "single",
    content: `export default {};`
  };
}

async function enterprise(ctx = {}) {
  const content = `import { Router } from "express";
import os from "os";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    ok: true,
    host: os.hostname(),
    uptime: process.uptime()
  });
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
