async function realistic(ctx = {}) {
  const content = `export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
};
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `export const config = {};`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const content = `import dotenv from "dotenv";
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGO_URI,
  redisUrl: process.env.REDIS_URL,
  enableTracing: process.env.ENABLE_TRACING === "true",
};
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  default: defaultVariant,
};
