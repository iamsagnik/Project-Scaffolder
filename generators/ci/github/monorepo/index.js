async function realistic(ctx = {}) {
  const nodeVersion = ctx.options?.nodeVersion || "18";

  const content = `name: Monorepo CI

on:
  push:
    branches: [ main ]

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: latest
          run_install: false

      - uses: actions/setup-node@v4
        with:
          node-version: ${nodeVersion}

      - run: pnpm install
      - run: pnpm -w build
      - run: pnpm -w test
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install && pnpm -w build
`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const nodeVersion = ctx.options?.nodeVersion || "18";

  const content = `name: Enterprise Monorepo CI

on:
  push:
    branches: [ main, develop ]
  pull_request:

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm -w lint

  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: latest
          run_install: false

      - uses: actions/setup-node@v4
        with:
          node-version: ${nodeVersion}

      - run: pnpm install
      - run: pnpm -w build
      - run: pnpm -w test
`;
  return { type: "single", content };
}

/* variant: workspace-build-test */
async function workspaceBuildTest(ctx = {}) {
  return realistic(ctx);
}

async function defaultVariant(ctx) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  "workspace-build-test": workspaceBuildTest,
  default: defaultVariant
};
