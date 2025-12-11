async function realistic(ctx = {}) {
  const content = `import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  transports: [new winston.transports.Console()],
});
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `export const logger = console;`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  defaultMeta: { service: "shared" },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/combined.log" })
  ],
});
`;
  return { type: "single", content };
}

/* template-specific */
async function winstonStandard(ctx = {}) {
  return realistic(ctx);
}

async function defaultVariant(ctx) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  winston: winstonStandard,
  default: defaultVariant,
};
