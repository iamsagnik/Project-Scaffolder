// generators/mern/frontend/config/env.js

async function defaultVariant(ctx = {}) {
  const api = ctx.options?.apiBase || "http://localhost:4000/api";

  const content = `// src/config/env.ts
export const API_BASE = import.meta.env.VITE_API_BASE_URL || "${api}";
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
