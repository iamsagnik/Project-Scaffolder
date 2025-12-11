async function realistic(ctx = {}) {
  const name = ctx.projectName || "shared";
  const content = `{
  "name": "@workspace/${name}",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p .",
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `{
  "name": "@workspace/shared",
  "version": "1.0.0"
}
`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const name = ctx.projectName || "shared";
  const content = `{
  "name": "@workspace/${name}",
  "version": "1.0.0",
  "private": true,
  "license": "MIT",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "clean": "rimraf dist",
    "build": "npm run clean && tsc -p .",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.3.3",
    "eslint": "^8.56.0",
    "rimraf": "^5.0.5"
  }
}
`;
  return { type: "single", content };
}

/* template-specific variant */
async function typescript(ctx = {}) {
  return realistic(ctx);
}

async function defaultVariant(ctx) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  typescript,
  default: defaultVariant,
};
