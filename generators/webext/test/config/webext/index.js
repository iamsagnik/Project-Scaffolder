async function standard(ctx = {}) {
  const content = `
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  transform: {
    "^.+\\\\.(ts|tsx)$": "ts-jest"
  }
};
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `module.exports = { testEnvironment: "jsdom" };`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return standard(ctx);
}

module.exports = {
  standard,
  minimal,
  default: defaultVariant
};
