async function backendFrontendDocker(ctx = {}) {
  const nodeVersion = ctx.options?.nodeVersion || "18";

  const content = `name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${nodeVersion}
      - run: npm ci
      - run: npm test

  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${nodeVersion}
      - run: npm ci
      - run: npm test
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `name: CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        dir: [backend, frontend]
    steps:
      - uses: actions/checkout@v4
      - run: cd \${{ matrix.dir }} && npm ci && npm test
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return backendFrontendDocker(ctx);
}

module.exports = {
  "backend-frontend-docker": backendFrontendDocker,
  minimal,
  default: defaultVariant,
};