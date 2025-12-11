async function buildTestZip(ctx = {}) {
  const nodeVersion = ctx.options?.nodeVersion || "18";

  const content = `
name: CI
on: [push]

jobs:
  build-test-zip:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${nodeVersion}
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: zip -r extension.zip dist
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return buildTestZip(ctx);
}

module.exports = {
  "build-test-zip": buildTestZip,
  minimal,
  default: defaultVariant
};
