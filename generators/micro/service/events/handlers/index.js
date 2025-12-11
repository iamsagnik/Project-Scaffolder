async function realistic(ctx = {}) {
  const service = ctx.variant || "service";
  const content = `export function registerEventHandlers(eventBus) {
  eventBus.subscribe("USER_CREATED", (payload) => {
    console.log("[${service}] User created:", payload);
  });
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  return { type: "single", content: `export const registerEventHandlers = () => {};` };
}

async function enterprise(ctx = {}) {
  const service = ctx.variant || "service";
  const content = `import { logger } from "../../shared/logger/logger";

export function registerEventHandlers(eventBus) {
  eventBus.subscribe("USER_CREATED", (payload) => {
    logger.info("[${service}] USER_CREATED event", payload);
  });

  eventBus.subscribe("ORDER_PLACED", (payload) => {
    logger.info("[${service}] ORDER_PLACED event", payload);
  });
}
`;
  return { type: "single", content };
}

/* Variants */
async function users(ctx = {}) {
  return realistic({ ...ctx, variant: "users" });
}

async function orders(ctx = {}) {
  return realistic({ ...ctx, variant: "orders" });
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  users,
  orders,
  default: defaultVariant
};
