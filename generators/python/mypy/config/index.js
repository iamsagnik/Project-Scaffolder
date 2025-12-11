async function standard(ctx = {}) {
  const content = `
[mypy]
ignore_missing_imports = True
strict = True
`;
  return { type: "single", content };
}

async function relaxed(ctx = {}) {
  const content = `
[mypy]
ignore_missing_imports = True
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return standard(ctx);
}

module.exports = {
  standard,
  relaxed,
  default: defaultVariant
};
