async function realistic(ctx = {}) {
  const content = `export * from "./logger/logger";
export * from "./config/env";
export * from "./eventBus";
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `export {};`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `export * from "./logger/logger";
export * from "./config/env";
export * from "./events/eventBus";
export * from "./events/types";
export * from "./utils";
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  default: defaultVariant,
};
