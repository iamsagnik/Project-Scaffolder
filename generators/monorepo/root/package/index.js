async function realistic(ctx = {}) {
  const name = ctx.projectName || "enterprise-monorepo";
  const content = `{
  "name": "${name}",
  "private": true,
  "version": "1.0.0",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "pnpm -w -r dev",
    "build": "pnpm -w -r build",
    "test": "pnpm -w -r test",
    "lint": "pnpm -w -r lint"
  }
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `{
  "name": "monorepo",
  "private": true,
  "workspaces": ["apps/*", "packages/*"]
}
`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const name = ctx.projectName || "enterprise-monorepo";
  const content = `{
  "name": "${name}",
  "private": true,
  "version": "1.0.0",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "pnpm -w -r dev",
    "build": "pnpm -w -r build",
    "test": "pnpm -w -r test",
    "lint": "pnpm -w -r lint",
    "ci:check": "pnpm -w -r lint && pnpm -w -r test"
  },
  "engines": {
    "node": ">=18"
  }
}
`;
  return { type: "single", content };
}

/* template-specific variant: "pnpm-workspaces" */
async function pnpmWorkspaces(ctx = {}) {
  // alias to realistic; kept for explicit variant lookup
  return realistic(ctx);
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  "pnpm-workspaces": pnpmWorkspaces,
  default: defaultVariant
};
