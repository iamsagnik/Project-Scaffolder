async function defaultVariant(ctx = {}) {
  const content = `// src/routes/index.routes.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const todoRoutes = require('./todo.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/todos', todoRoutes);

module.exports = router;
`;
  return { type: "single", content };
}

module.exports = { default: defaultVariant };