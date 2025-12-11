async function realistic(ctx = {}) {
  const content = `NODE_ENV=development
PORT=3000
JWT_SECRET=changeme
MONGO_URI=mongodb://localhost:27017/root
REDIS_URL=redis://localhost:6379
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `PORT=3000`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `NODE_ENV=production
PORT=8080
JWT_SECRET=
MONGO_URI=
REDIS_URL=
TELEMETRY_ENDPOINT=
ENABLE_RATE_LIMITING=true
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
  default: defaultVariant,
};
