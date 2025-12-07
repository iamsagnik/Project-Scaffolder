// generators/mern/backend/service/auth.js

async function defaultVariant(ctx = {}) {
  const content = `// src/services/auth.service.js
const User = require('../models/user.model');
const jwtUtil = require('../utils/jwt');

exports.register = async (data) => {
  return User.create(data);
};

exports.login = async (email, password) => {
  const user = await User.findByCredentials(email, password);
  return {
    user,
    token: jwtUtil.sign({ sub: user._id })
  };
};
`;
  return { type: "single", content };
}

module.exports = { default: defaultVariant };
