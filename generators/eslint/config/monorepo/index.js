async function realistic(ctx = {}) {
  const content = `module.exports = {
  root: true,
  extends: ["eslint:recommended"],
  parserOptions: { ecmaVersion: 2022, sourceType: "module" }
};
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `module.exports = { root: true };`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: 2022, sourceType: "module", ecmaFeatures: { jsx: true } },
  settings: { react: { version: "detect" } }
};
`;
  return { type: "single", content };
}

/* template-specific variant: "ts-react-node" */
async function tsReactNode(ctx = {}) {
  return enterprise(ctx);
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  "ts-react-node": tsReactNode,
  default: defaultVariant
};
