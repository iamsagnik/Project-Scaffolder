async function base(ctx = {}) {
  const content = JSON.stringify(
    {
      compilerOptions: {
        target: "ESNext",
        module: "ESNext",
        moduleResolution: "Node",
        strict: true,
        jsx: "react-jsx"
      }
    },
    null,
    2
  );

  return { type: "single", content };
}

async function relaxed(ctx = {}) {
  const content = JSON.stringify(
    {
      compilerOptions: {
        target: "ES6",
        strict: false
      }
    },
    null,
    2
  );
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return base(ctx);
}

module.exports = {
  base,
  relaxed,
  default: defaultVariant
};
