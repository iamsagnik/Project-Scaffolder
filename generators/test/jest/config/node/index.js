async function express(ctx = {}) {
  const content = `module.exports = {
  testEnvironment: "node",
  testTimeout: 20000,
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  collectCoverage: true,
  coverageDirectory: "coverage"
};`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `module.exports = {
  testEnvironment: "node",
  testTimeout: 10000
};`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return express(ctx);
}

module.exports = {
  express,
  minimal,
  default: defaultVariant,
};
