async function realistic(ctx = {}) {
  const content = `packages:
  - 'apps/*'
  - 'packages/*'
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `packages:
  - 'apps/*'
`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `packages:
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'
  - 'docs/*'
virtual-store-dir: .pnpm
`;
  return { type: "single", content };
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = { realistic, minimal, enterprise, default: defaultVariant };
