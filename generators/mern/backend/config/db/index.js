// generators/mern/backend/config/db.js

async function mongodb(ctx = {}) {
  const content = `// src/config/db.js
const mongoose = require('mongoose');
const logger = require('./logger');
const { mongoUri } = require('./env');

async function connect() {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection failed", err);
    throw err;
  }
}

module.exports = { connect };
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return mongodb(ctx);
}

module.exports = { mongodb, default: defaultVariant };