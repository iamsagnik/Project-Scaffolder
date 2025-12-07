async function bootstrap(ctx = {}) {
  const port = ctx.options?.backendPort || 4000;

  const content = `// src/index.js
require('dotenv').config();
const http = require('http');
const app = require('./app');
const logger = require('./config/logger');
const { connect } = require('./config/db');

const PORT = process.env.PORT || ${port};

(async () => {
  await connect();
  
  const server = http.createServer(app);

  server.listen(PORT, () => {
    logger.info(\`Server running on port \${PORT}\`);
  });
})();

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection', err);
  process.exit(1);
});
`;

  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return bootstrap(ctx);
}

module.exports = { bootstrap, default: defaultVariant };
