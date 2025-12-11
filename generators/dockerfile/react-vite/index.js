async function realistic(ctx = {}) {
  const content = `FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM nginx:stable
COPY --from=builder /app/dist /usr/share/nginx/html
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "run", "dev"]
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

FROM nginx:stable
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
`;
  return { type: "single", content };
}

/* variant: nginx-prod */
async function nginxProd(ctx = {}) {
  return enterprise(ctx);
}

async function defaultVariant(ctx) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  "nginx-prod": nginxProd,
  default: defaultVariant
};
