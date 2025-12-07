// generators/mern/backend/config/env.js

async function defaultVariant(ctx = {}) {
  const port = ctx.options?.backendPort || 4000;

  const content = `// src/config/env.js
module.exports = {
  port: process.env.PORT || ${port},
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/mern_db",
  jwtSecret: process.env.JWT_SECRET || "replace_this"
};
`;
  return { type: "single", content };
}

module.exports = { default: defaultVariant };