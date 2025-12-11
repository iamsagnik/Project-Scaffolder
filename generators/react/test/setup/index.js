// generators/react/test/setup.js

async function vitest(ctx = {}) {
  const content = `// src/tests/setup.ts
import '@testing-library/jest-dom';

// Global mocks or test setup can be placed here.
// Example: configure global fetch mock, set up test routers, etc.
`;
  return { type: "single", content };
}

async function defaultVariant(ctx = {}) { return vitest(ctx); }

module.exports = {
  vitest,
  default: defaultVariant,
};
