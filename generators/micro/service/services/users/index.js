async function realistic(ctx = {}) {
  const content = `export async function getUsers() {
  return [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" }
  ];
}

export async function createUser(data) {
  return { id: Date.now(), ...data };
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  return { type: "single", content: `export const getUsers = () => [];` };
}

async function enterprise(ctx = {}) {
  const content = `import { logger } from "../../shared/logger/logger";

export async function getUsers() {
  logger.info("Fetching all users");
  return [
    { id: 1, name: "Enterprise User" }
  ];
}

export async function createUser(data) {
  logger.info({ action: "createUser", data });
  return { id: Date.now(), ...data };
}
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
