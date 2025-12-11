async function realistic(ctx = {}) {
  const content = `import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  product: String,
  quantity: Number,
  status: { type: String, default: "pending" }
});

export const Order = mongoose.model("Order", orderSchema);
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  return { type: "single", content: `export const Order = {};` };
}

async function enterprise(ctx = {}) {
  const content = `import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  product: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, default: "pending" }
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);
`;
  return { type: "single", content };
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = { realistic, minimal, enterprise, default: defaultVariant };
