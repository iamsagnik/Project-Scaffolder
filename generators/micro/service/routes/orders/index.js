async function realistic(ctx = {}) {
  const content = `import { Router } from "express";
import { listOrders, createOrder } from "../services/orders.service";

const router = Router();

router.get("/", async (_req, res) => {
  const orders = await listOrders();
  res.json(orders);
});

router.post("/", async (req, res) => {
  const order = await createOrder(req.body);
  res.status(201).json(order);
});

export default router;
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  return { type: "single", content: `export default {};` };
}

async function enterprise(ctx = {}) {
  const content = `import { Router } from "express";
import { listOrders, createOrder } from "../services/orders.service";
import { logger } from "../../shared/logger/logger";

const router = Router();

router.get("/", async (_req, res) => {
  logger.info("Listing all orders");
  const orders = await listOrders();
  res.json(orders);
});

router.post("/", async (req, res) => {
  logger.info("Creating new order", req.body);
  const order = await createOrder(req.body);
  res.status(201).json(order);
});

export default router;
`;
  return { type: "single", content };
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = { realistic, minimal, enterprise, default: defaultVariant };
