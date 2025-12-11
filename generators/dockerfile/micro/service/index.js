async function realistic(ctx = {}) {
  const nodeVersion = ctx.options?.nodeVersion || "18";
  const service = ctx.variant || "service";

  const content = `FROM node:${nodeVersion}-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
CMD ["node", "dist/index.js"]
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `FROM node:18-alpine
WORKDIR /app
COPY . .
CMD ["node", "index.js"]
`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const nodeVersion = ctx.options?.nodeVersion || "18";
  const service = ctx.variant || "service";

  const content = `# Multi-stage optimized Dockerfile
FROM node:${nodeVersion}-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:${nodeVersion}-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm ci --production
USER node
CMD ["node", "dist/index.js"]
`;
  return { type: "single", content };
}

/* Template-specific variants */
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
