// generators/mern/backend/service/todo.js

async function defaultVariant(ctx = {}) {
  const content = `// src/services/todo.service.js
const Todo = require('../models/todo.model');

exports.list = (ownerId) => Todo.find({ owner: ownerId });
exports.create = (data) => Todo.create(data);
exports.getById = (id, ownerId) => Todo.findOne({ _id: id, owner: ownerId });
exports.update = (id, ownerId, data) =>
  Todo.findOneAndUpdate({ _id: id, owner: ownerId }, data, { new: true });
exports.remove = (id, ownerId) =>
  Todo.deleteOne({ _id: id, owner: ownerId });
`;
  return { type: "single", content };
}

module.exports = { default: defaultVariant };
