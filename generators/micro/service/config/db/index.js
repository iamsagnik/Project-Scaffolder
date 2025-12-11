async function realistic(ctx = {}) {
  const service = ctx.variant || "service";

  const content = `import mongoose from "mongoose";

export async function initDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/${service}";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB for ${service}");
}
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `export const initDB = async () => {};`;
  return { type: "single", content };
}

async function enterprise(ctx = {}) {
  const service = ctx.variant || "service";

  const content = `import mongoose from "mongoose";
import { logger } from "../../shared/logger/logger";

export async function initDB() {
  const uri = process.env.MONGO_URI;
  await mongoose.connect(uri);
  logger.info("DB connected for ${service} service");
}
`;
  return { type: "single", content };
}

async function users(ctx = {}) {
  return realistic({ ...ctx, variant: "users" });
}

async function orders(ctx = {}) {
  return realistic({ ...ctx, variant: "orders" });
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = {
  realistic,
  minimal,
  enterprise,
  users,
  orders,
  default: defaultVariant
};
