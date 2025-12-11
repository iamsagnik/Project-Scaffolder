async function realistic(ctx = {}) {
  const content = `import { createServer } from "./app";

const port = process.env.PORT || 4000;
const app = createServer();

app.listen(port, () => {
  console.log("Backend running on port", port);
});
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  return { type: "single", content: `console.log("backend");` };
}

async function enterprise(ctx = {}) {
  const content = `import { createServer } from "./app";
import { logger } from "../../packages/shared-utils/src/logger";

const port = process.env.PORT || 4000;
const app = createServer();

app.listen(port, () => {
  logger.info(\`Backend listening on port \${port}\`);
});
`;
  return { type: "single", content };
}

/* variant: monorepo-bootstrap */
async function monorepoBootstrap(ctx = {}) {
  return realistic(ctx);
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  "monorepo-bootstrap": monorepoBootstrap,
  default: defaultVariant
};
