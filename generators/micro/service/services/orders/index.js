async function realistic(ctx = {}) {
  const content = `export async function listOrders() {
  return [
    { id: 1, product: "Book", quantity: 2, status: "pending" }
  ];
}

export async function createOrder(data) {
  return { id: Date.now(), ...data };
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  return { type: "single", content: `export const listOrders = () => [];` };
}

async function enterprise(ctx = {}) {
  const content = `import { logger } from "../../shared/logger/logger";

export async function listOrders() {
  logger.info("Fetching orders");
  return [
    { id: 1, product: "Book", quantity: 2, status: "pending" }
  ];
}

export async function createOrder(data) {
  logger.info("Creating order", data);
  return { id: Date.now(), ...data };
}
`;
  return { type: "single", content };
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = { realistic, minimal, enterprise, default: defaultVariant };
