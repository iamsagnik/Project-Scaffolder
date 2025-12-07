async function defaultVariant(ctx = {}) {
  const content = `// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
`;
  return { type: "single", content };
}

module.exports = { default: defaultVariant };
