async function realistic(ctx = {}) {
  const content = `{
  "name": "@shared/utils",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p ."
  }
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  return {
    type: "single",
    content: `{
  "name": "@shared/utils",
  "private": true
}`
  };
}

async function enterprise(ctx = {}) {
  const content = `{
  "name": "@shared/utils",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "clean": "rimraf dist",
    "build": "npm run clean && tsc -p ."
  }
}
`;
  return { type: "single", content };
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  default: defaultVariant
};
