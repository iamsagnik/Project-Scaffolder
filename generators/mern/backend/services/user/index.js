// generators/mern/backend/service/user.js

async function defaultVariant(ctx = {}) {
  const content = `// src/services/user.service.js
const User = require('../models/user.model');

exports.list = () => User.find().select('-password');
exports.getById = (id) => User.findById(id).select('-password');
`;
  return { type: "single", content };
}

module.exports = { default: defaultVariant };
