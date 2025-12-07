// generators/mern/backend/routes/todo.js

async function defaultVariant(ctx = {}) {
  const content = `// src/routes/todo.routes.js
const express = require('express');
const router = express.Router();

const todoController = require('../controllers/todo.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

router.get('/', requireAuth, todoController.list);
router.post('/', requireAuth, todoController.create);
router.get('/:id', requireAuth, todoController.getById);
router.put('/:id', requireAuth, todoController.update);
router.delete('/:id', requireAuth, todoController.remove);

module.exports = router;
`;
  return { type: "single", content };
}

module.exports = { default: defaultVariant };
