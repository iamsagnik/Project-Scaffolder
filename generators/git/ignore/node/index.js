async function standard(ctx = {}) {
  const content = `
node_modules
dist
.env
.DS_Store
`;
  return { type: "single", content };
}

async function extended(ctx = {}) {
  const content = `
node_modules
dist
.env
coverage
logs
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return standard(ctx);
}

module.exports = {
  standard,
  extended,
  default: defaultVariant
};
