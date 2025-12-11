async function realistic(ctx = {}) {
  const service = ctx.variant || ctx.options?.service || "service";
  const content = `NODE_ENV=development
PORT=${ctx.options?.port || (service === "gateway" ? 8080 : 3000)}
SERVICE_NAME=${service}
MONGO_URI=mongodb://mongo:27017/${service}
REDIS_URL=redis://redis:6379
JWT_SECRET=changeme
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const service = ctx.variant || ctx.options?.service || "service";
  const content = `PORT=${ctx.options?.port || 3000}
SERVICE_NAME=${service}
`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const service = ctx.variant || ctx.options?.service || "service";
  const content = `NODE_ENV=production
PORT=${ctx.options?.port || (service === "gateway" ? 8080 : 3000)}
SERVICE_NAME=${service}
MONGO_URI=${ctx.options?.mongoUri || ""}
REDIS_URL=${ctx.options?.redisUrl || ""}
JWT_SECRET=
OTLP_ENDPOINT=
SENTRY_DSN=
`;
  return { type: "single", content };
}

/* template-specific variants */
async function gateway(ctx = {}) {
  ctx = { ...ctx, variant: "gateway" };
  return realistic(ctx);
}
async function users(ctx = {}) {
  ctx = { ...ctx, variant: "users" };
  return realistic(ctx);
}
async function orders(ctx = {}) {
  ctx = { ...ctx, variant: "orders" };
  return realistic(ctx);
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  gateway,
  users,
  orders,
  default: defaultVariant
};
