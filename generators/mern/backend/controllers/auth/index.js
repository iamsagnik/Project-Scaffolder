// generators/mern/backend/controller/auth.js

async function defaultVariant(ctx = {}) {
  const content = `// src/controllers/auth.controller.js
const User = require('../models/user.model');
const jwtUtil = require('../utils/jwt');
const logger = require('../config/logger');

exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.create({ email, password });
    return res.status(201).json({
      id: user._id,
      email: user.email
    });
  } catch (err) {
    logger.error(err);
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByCredentials(email, password);
    const token = jwtUtil.sign({ sub: user._id });

    return res.json({ token });
  } catch (err) {
    return next(err);
  }
};
`;
  return { type: "single", content };
}

module.exports = { default: defaultVariant };
