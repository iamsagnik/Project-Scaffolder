async function enterprise(ctx = {}) {
  const projectName = ctx.options?.projectName || "web-extension-enterprise";

  const content = JSON.stringify(
    {
      name: projectName,
      version: "1.0.0",
      private: true,
      scripts: {
        dev: "vite",
        build: "vite build",
        test: "jest"
      }
    },
    null,
    2
  );

  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = JSON.stringify(
    {
      name: "webext-app",
      version: "1.0.0"
    },
    null,
    2
  );

  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return enterprise(ctx);
}

module.exports = {
  enterprise,
  minimal,
  default: defaultVariant
};
