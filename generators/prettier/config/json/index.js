async function standard(ctx = {}) {
  const content = JSON.stringify(
    {
      semi: true,
      singleQuote: false,
      trailingComma: "es5"
    },
    null,
    2
  );
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = JSON.stringify(
    { semi: false },
    null,
    2
  );
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
