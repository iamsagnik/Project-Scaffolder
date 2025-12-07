async function standard(ctx = {}) {
  const content = `
export const ENV = {
  MODE: import.meta.env.MODE,
  API_URL: import.meta.env.VITE_API_URL
};
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `export const ENV = {};`;
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
