// generators/mern/backend/util/response

async function defaultVariant(ctx = {}) {
  const content = `// src/utils/response.js

exports.ok = (res, data) => res.json(data);

exports.created = (res, data) => res.status(201).json(data);

exports.noContent = (res) => res.status(204).send();
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
