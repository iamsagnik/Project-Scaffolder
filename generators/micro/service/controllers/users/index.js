async function realistic(ctx = {}) {
  const content = `export async function listUsers(req, res) {
  res.json([{ id: 1, name: "Test User" }]);
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  return { type: "single", content: `export const listUsers = () => {};` };
}

async function enterprise(ctx = {}) {
  const content = `import { logger } from "../../shared/logger/logger";

export async function listUsers(req, res) {
  logger.info("Users controller triggered");
  res.json([{ id: 1, name: "Test User" }]);
}
`;
  return { type: "single", content };
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = { realistic, minimal, enterprise, default: defaultVariant };
