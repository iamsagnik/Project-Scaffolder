async function reactMv3MultiEntry(ctx = {}) {
  const content = `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: "src/popup/main.tsx",
        options: "src/options/main.tsx",
        background: "src/background/index.ts",
        content: "src/content/index.ts"
      }
    }
  }
});
`;
  return { type: "single", content };
}

async function singleEntry(ctx = {}) {
  const content = `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()]
});
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return reactMv3MultiEntry(ctx);
}

module.exports = {
  "react-mv3-multi-entry": reactMv3MultiEntry,
  singleEntry,
  default: defaultVariant
};
