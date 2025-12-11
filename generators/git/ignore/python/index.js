async function standard(ctx = {}) {
  const content = `
__pycache__/
*.pyc
env/
venv/
dist/
build/
*.log
.coverage
`;
  return { type: "single", content };
}

async function extended(ctx = {}) {
  const content = `
__pycache__/
*.pyc
env/
venv/
dist/
build/
coverage/
logs/
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
