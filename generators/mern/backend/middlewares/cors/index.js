// generators/mern/backend/middleware/cors.js

async function defaultVariant(ctx = {}) {
  const content = `// src/middlewares/cors.middleware.js
const cors = require('cors');

module.exports = cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
});
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
