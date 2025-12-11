async function realistic(ctx = {}) {
  const content = `export async function listOrders(req, res) {
  res.json([{ id: 1, status: "pending" }]);
}

export async function createOrder(req, res) {
  const newOrder = { id: Date.now(), ...req.body };
  res.status(201).json(newOrder);
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `export const listOrders = () => {};`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `import { logger } from "../../shared/logger/logger";

export async function listOrders(req, res) {
  logger.info("Fetching orders");
  res.json([{ id: 1, status: "pending" }]);
}

export async function createOrder(req, res) {
  logger.info("Creating order", req.body);
  const order = { id: Date.now(), ...req.body };
  res.status(201).json(order);
}
`;
  return { type: "single", content };
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = { realistic, minimal, enterprise, default: defaultVariant };
