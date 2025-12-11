async function realistic(ctx = {}) {
  const content = `version: "3.9"
services:
  frontend:
    build: ./apps/frontend
    ports:
      - "3000:3000"
  backend:
    build: ./apps/backend
    ports:
      - "4000:4000"
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `version: "3"
services:
  backend:
    build: ./apps/backend
`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `version: "3.9"
services:
  frontend:
    build: ./apps/frontend
    ports:
      - "3000:3000"
    deploy:
      replicas: 2
  backend:
    build: ./apps/backend
    ports:
      - "4000:4000"
    deploy:
      replicas: 2
  proxy:
    image: nginx:stable
    ports:
      - "80:80"
`;
  return { type: "single", content };
}

/* template-specific variant: "frontend-backend" */
async function frontendBackend(ctx = {}) {
  return realistic(ctx);
}

async function defaultVariant(ctx) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  "frontend-backend": frontendBackend,
  default: defaultVariant
};
