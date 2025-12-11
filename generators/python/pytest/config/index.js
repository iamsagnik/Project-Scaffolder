async function standard(ctx = {}) {
  const content = `
[pytest]
DJANGO_SETTINGS_MODULE = config.settings.dev
python_files = tests.py test_*.py
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `[pytest]\nDJANGO_SETTINGS_MODULE=config.settings.dev`;
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
