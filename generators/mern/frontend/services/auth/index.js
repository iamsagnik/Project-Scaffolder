// generators/mern/frontend/service/auth.js

async function defaultVariant(ctx = {}) {
  const content = `// src/services/auth.service.ts
import http from './http.service';

export async function login(email: string, password: string) {
  const res = await http.post("/auth/login", { email, password });
  return res.data;
}

export async function register(email: string, password: string) {
  return http.post("/auth/register", { email, password });
}
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
