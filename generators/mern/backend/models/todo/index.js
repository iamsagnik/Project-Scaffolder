// generators/mern/backend/model/todo.js

async function mongoose(ctx = {}) {
  const content = `// src/models/todo.model.js
const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Todo', TodoSchema);
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return mongoose(ctx);
}

module.exports = {
  mongoose,
  default: defaultVariant,
};
