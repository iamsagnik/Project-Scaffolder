// generators/mern/frontend/config/api.js

async function backendBaseUrl(ctx = {}) {
  const api = ctx.options?.apiBase || "http://localhost:4000/api";

  const content = `// src/config/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: "${api}",
  timeout: 10000
});
`;

  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return backendBaseUrl(ctx);
}

module.exports = {
  "backend-base-url": backendBaseUrl,
  default: defaultVariant,
};
