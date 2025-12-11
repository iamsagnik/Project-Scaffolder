async function realistic(ctx = {}) {
  const content = `# Monorepo env example
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `PORT=3000`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `NODE_ENV=production
PORT=3000
API_URL=https://api.example.com
SENTRY_DSN=
OTLP_ENDPOINT=
`;
  return { type: "single", content };
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = { realistic, minimal, enterprise, default: defaultVariant };
