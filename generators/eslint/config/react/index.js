async function webextTs(ctx = {}) {
  const content = `
module.exports = {
  env: { browser: true, es2021: true },
  extends: ["plugin:react/recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["react", "@typescript-eslint"]
};
`;
  return { type: "single", content };
}

async function relaxed(ctx = {}) {
  const content = `
module.exports = {
  env: { browser: true },
  extends: ["plugin:react/recommended"]
};
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return webextTs(ctx);
}

module.exports = {
  "webext-ts": webextTs,
  relaxed,
  default: defaultVariant
};
