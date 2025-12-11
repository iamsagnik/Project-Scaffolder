async function realistic(ctx = {}) {
  const content = `export const API_BASE_URL = "http://localhost:4000";`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  return { type: "single", content: `export const API_BASE_URL = "";` };
}

async function enterprise(ctx = {}) {
  const content = `export const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
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
  realistic,
  minimal,
  enterprise,
  "monorepo-backend": monorepoBackend,
  default: defaultVariant
};
