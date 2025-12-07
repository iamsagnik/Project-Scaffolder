// generators/mern/backend/middleware/validate.js

async function defaultVariant(ctx = {}) {
  const content = `// src/middlewares/validate.middleware.js

exports.validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  next();
};
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
