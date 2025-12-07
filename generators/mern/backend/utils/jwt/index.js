// generators/mern/backend/util/jwt.js

async function defaultVariant(ctx = {}) {
  const content = `// src/utils/jwt.js
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');

exports.sign = (payload, opts = {}) =>
  jwt.sign(payload, jwtSecret, { expiresIn: opts.expiresIn || "7d" });

exports.verify = (token) =>
  jwt.verify(token, jwtSecret);
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
