async function jest(ctx = {}) {
  const content = `
import "@testing-library/jest-dom";

beforeAll(() => {
  console.log("Jest setup initialized.");
});
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `// Jest setup placeholder`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return jest(ctx);
}

module.exports = {
  jest,
  minimal,
  default: defaultVariant
};
