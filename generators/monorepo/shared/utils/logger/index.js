async function realistic(ctx = {}) {
  const content = `export function logger(...args) {
  console.log("[LOG]", ...args);
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  return { type: "single", content: `export const logger = () => {};` };
}

async function enterprise(ctx = {}) {
  const content = `export function logger(...args) {
  const timestamp = new Date().toISOString();
  console.log(\`[\${timestamp}] [LOG]\`, ...args);
}
`;
  return { type: "single", content };
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = { realistic, minimal, enterprise, default: defaultVariant };
