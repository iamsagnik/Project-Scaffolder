async function realistic(ctx = {}) {
  const nodeVersion = ctx.options?.nodeVersion || "18";
  const content = `name: CI

on:
  push:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [gateway, users-service, orders-service]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${nodeVersion}

      - run: cd services/\${{ matrix.service }} && npm ci && npm test
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `name: CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test
`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const nodeVersion = ctx.options?.nodeVersion || "18";
  const content = `name: Enterprise CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run lint --workspaces

  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [gateway, users-service, orders-service]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${nodeVersion}
      - run: cd services/\${{ matrix.service }} && npm ci && npm test

  docker-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t registry/\${{ github.repository }}/gateway ./services/gateway
`;
  return { type: "single", content };
}

/* Template-specific variant: "gateway-and-services" */
async function gatewayAndServices(ctx = {}) {
  const nodeVersion = ctx.options?.nodeVersion || "18";
  const content = `name: CI
on:
  push:
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

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  "gateway-and-services": gatewayAndServices,
  default: defaultVariant,
};
