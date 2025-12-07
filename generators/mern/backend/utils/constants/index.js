// generators/mern/backend/util/constants

async function defaultVariant(ctx = {}) {
  const content = `// src/utils/constants.js

module.exports = {
  DEFAULT_PAGE_SIZE: 20,
  APP_NAME: process.env.PROJECT_NAME || "MERN App"
};
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
