// generators/mern/backend/controller/todo.js

async function defaultVariant(ctx = {}) {
  const content = `// src/controllers/todo.controller.js
const Todo = require('../models/todo.model');

exports.list = async (req, res, next) => {
  try {
    const todos = await Todo.find({ owner: req.user.id });
    return res.json(todos);
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const todo = await Todo.create({ ...req.body, owner: req.user.id });
    return res.status(201).json(todo);
  } catch (err) {
    return next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, owner: req.user.id });
    if (!todo) return res.status(404).send();
    return res.json(todo);
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      req.body,
      { new: true }
    );
    return res.json(todo);
  } catch (err) {
    return next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await Todo.deleteOne({ _id: req.params.id, owner: req.user.id });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};
`;
  return { type: "single", content };
}

module.exports = { default: defaultVariant };
