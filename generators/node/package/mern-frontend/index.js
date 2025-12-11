// generators/node/package/mern-frontend.js

async function reactVite(ctx = {}) {
  const name = ctx.options?.projectName || "frontend";

  const pkg = {
    name,
    version: "1.0.0",
    private: true,
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
      test: "vitest"
    },
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
      "react-router-dom": "^6.11.0",
      axios: "^1.3.0",
      zustand: "^4.3.0"
    },
    devDependencies: {
      vite: "^5.0.0",
      typescript: "^5",
      vitest: "^0.34.0",
      "@testing-library/react": "^14.0.0",
      "@vitejs/plugin-react": "^4.0.0"
    }
  };

  return { type: "single", content: JSON.stringify(pkg, null, 2) + "\n" };
}

async function defaultVariant(ctx) {
  return reactVite(ctx);
}

module.exports = {
  "react-vite": reactVite,
  default: defaultVariant,
};
