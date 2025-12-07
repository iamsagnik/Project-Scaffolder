// generators/mern/backend/controller/health.js

async function defaultVariant(ctx = {}) {
  const content = `// src/controllers/health.controller.js
exports.ping = (req, res) => {
  return res.json({ status: "ok" });
};
`;
  return { type: "single", content };
}

module.exports = { default: defaultVariant };
