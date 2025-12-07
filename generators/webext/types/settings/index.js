async function standard(ctx = {}) {
  const content = `
// Extension settings type definitions

export const DEFAULT_SETTINGS = {
  darkMode: false
};

/**
 * @typedef {{ darkMode: boolean }} Settings
 */
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `export const DEFAULT_SETTINGS = {};`;
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
