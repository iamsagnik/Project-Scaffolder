async function standard(ctx = {}) {
  const content = `
export const logger = {
  info: (...args) => console.log("[INFO]", ...args),
  warn: (...args) => console.warn("[WARN]", ...args),
  error: (...args) => console.error("[ERROR]", ...args)
};
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `
export const logger = { log: (...a) => console.log(...a) };
`;
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
