async function mernBackend(ctx = {}) {
  const port = ctx.options?.backendPort || 4000;

  const content = `# Dockerfile for MERN backend
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

ENV NODE_ENV=production
ENV PORT=${port}

EXPOSE ${port}

CMD ["node", "src/index.js"]
`;

  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --production
CMD ["node", "dist/index.js"]
`;
  return { type: "single", content };
}

/* variant: monorepo-backend */
async function monorepoBackend(ctx = {}) {
  return enterprise(ctx);
}

async function defaultVariant(ctx) {
  return realistic(ctx);
}

module.exports = {
  "mern-backend": mernBackend,
  "monorepo-backend": monorepoBackend,
  default: defaultVariant,
};
