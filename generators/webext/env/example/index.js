async function mv3(ctx = {}) {
  const content = `# Example environment file
VITE_APP_ENV=development
API_URL=https://api.example.com
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `VITE_APP_ENV=dev`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return mv3(ctx);
}

module.exports = {
  mv3,
  minimal,
  default: defaultVariant
};
