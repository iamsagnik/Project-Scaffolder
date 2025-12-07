// generators/mern/backend/app.js

async function mvcLayered(ctx = {}) {
  const content = `// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', routes);

// MUST be last
app.use(errorHandler);

module.exports = app;
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return mvcLayered(ctx);
}

module.exports = { "mvc-layered": mvcLayered, default: defaultVariant };