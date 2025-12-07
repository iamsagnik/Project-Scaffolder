// generators/mern/frontend/test/setup.js

async function vitestFrontend(ctx = {}) {
  const content = `// src/tests/setup.ts
// Frontend-specific test setup (vitest / testing-library)
import '@testing-library/jest-dom';
// You can add global mocks or polyfills here
`;
  return { type: "single", content };
}

async function defaultVariant(ctx = {}) { return vitestFrontend(ctx); }

module.exports = {
  'vitest': vitestFrontend,
  default: defaultVariant,
};
