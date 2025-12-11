async function realistic(ctx = {}) {
  const name = ctx.projectName || "@workspace/service";
  const content = `{
  "name": "${name}",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p .",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "test": "jest"
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node": "^10.0.0",
    "jest": "^29.0.0"
  }
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `{
  "name": "service",
  "version": "0.0.1",
  "scripts": { "start": "node index.js" }
}
`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const name = ctx.projectName || "@workspace/service";
  const content = `{
  "name": "${name}",
  "version": "1.0.0",
  "private": true,
  "license": "MIT",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "clean": "rimraf dist",
    "build": "npm run clean && tsc -p .",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "lint": "eslint src --ext .ts",
    "test": "jest --coverage"
  },
  "workspaces": ["../shared"],
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node": "^10.0.0",
    "eslint": "^8.0.0",
    "jest": "^29.0.0",
    "rimraf": "^5.0.0"
  }
}
`;
  return { type: "single", content };
}

/* service-specific variants referenced in template */
async function gateway(ctx = {}) {
  const content = await realistic(ctx);
  // return same shape as realistic but allow gateway-specific overrides if needed
  return content;
}

async function users(ctx = {}) {
  const content = await realistic(ctx);
  return content;
}

async function orders(ctx = {}) {
  const content = await realistic(ctx);
  return content;
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  gateway,
  users,
  orders,
  default: defaultVariant
};
