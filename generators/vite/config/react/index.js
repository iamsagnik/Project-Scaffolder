// generators/vite/config/react.js

async function mernProxy(ctx = {}) {
  const backend = ctx.options?.backendUrl || "http://localhost:4000";

  const content = `// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "${backend}"
    }
  }
});
`;

  return { type: "single", content };
}

async function monorepo(ctx = {}) {
  return enterprise(ctx);
}

async function defaultVariant(ctx) {
  return mernProxy(ctx);
}

module.exports = {
  "mern-proxy": mernProxy,
  "monorepo": monorepo,
  default: defaultVariant,
};
