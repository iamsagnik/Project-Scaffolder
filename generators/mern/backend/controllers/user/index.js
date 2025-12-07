// generators/mern/backend/controller/user.js

async function defaultVariant(ctx = {}) {
  const content = `// src/controllers/user.controller.js
const User = require('../models/user.model');

exports.list = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    return res.json(users);
  } catch (err) {
    return next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).send();
    return res.json(user);
  } catch (err) {
    return next(err);
  }
};
`;
  return { type: "single", content };
}

module.exports = { default: defaultVariant };
