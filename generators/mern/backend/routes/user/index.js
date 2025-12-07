// generators/mern/backend/routes/user.js

async function defaultVariant(ctx = {}) {
  const content = `// src/routes/user.routes.js
const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

router.get('/', requireAuth, userController.list);
router.get('/:id', requireAuth, userController.getById);

module.exports = router;
`;
  return { type: "single", content };
}

module.exports = { default: defaultVariant };
