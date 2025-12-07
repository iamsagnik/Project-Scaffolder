// generators/mern/backend/middleware/auth.js

async function jwt(ctx = {}) {
  const content = `// src/middlewares/auth.middleware.js
const jwtUtil = require('../utils/jwt');
const User = require('../models/user.model');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.replace(/^Bearer\\s+/i, "");

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = jwtUtil.verify(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = {
      id: user._id,
      email: user.email
    };

    next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { requireAuth };
`;

  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return jwt(ctx);
}

module.exports = {
  jwt,
  default: defaultVariant,
};
