async function defaultVariant(ctx = {}) {
  const ext = ctx.options?.ext || "js,json";
  const exec = ctx.options?.exec || "node src/index.js";

  const content =
    JSON.stringify(
      {
        watch: ["src"],
        ext,
        ignore: ["src/**/*.test.js"],
        exec,
      },
      null,
      2
    ) + "\n";

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
