async function nodeBase(ctx = {}) {
  const content = JSON.stringify(
    {
      compilerOptions: {
        module: "CommonJS",
        target: "ES2020",
        outDir: "dist"
      }
    },
    null,
    2
  );

  return { type: "single", content };
}

async function debug(ctx = {}) {
  const content = JSON.stringify(
    {
      compilerOptions: {
        module: "CommonJS",
        target: "ES2020",
        sourceMap: true
      }
    },
    null,
    2
  );

  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return nodeBase(ctx);
}

module.exports = {
  base: nodeBase,
  debug,
  default: defaultVariant
};
