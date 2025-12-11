async function realistic(ctx = {}) {
  const content = `node_modules/
.pnpm-store/
dist/
.env
.env.local
.vscode/
.DS_Store
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `node_modules/
dist/
`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `node_modules/
.pnpm-store/
dist/
.env
.env.*
.vscode/
.idea/
logs/
coverage/
.DS_Store
`;
  return { type: "single", content };
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = { realistic, minimal, enterprise, default: defaultVariant };
