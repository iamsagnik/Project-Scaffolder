async function root(ctx = {}) {
  const proj = ctx.options?.projectName || "mern-enterprise-app";
  const api = ctx.options?.apiBase || "http://localhost:4000/api";

  const content = `# Root .env.example
PROJECT_NAME=${proj}
NODE_ENV=development

BACKEND_PORT=4000
MONGO_URI=mongodb://mongo:27017/mern_db
JWT_SECRET=replace_this

VITE_API_BASE_URL=${api}
`;
  return { type: "single", content };
}

async function frontend(ctx = {}) {
  const api = ctx.options?.apiBase || "http://localhost:4000/api";
  const content = `VITE_API_BASE_URL=${api}
VITE_APP_TITLE=${ctx.options?.appTitle || "MERN App"}
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return root(ctx);
}

module.exports = {
  root,
  frontend,
  default: defaultVariant,
};