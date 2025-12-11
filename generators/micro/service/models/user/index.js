async function realistic(ctx = {}) {
  const content = `import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: String,
  email: String
});

export const User = mongoose.model("User", schema);
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  return { type: "single", content: `export const User = {};` };
}

async function enterprise(ctx = {}) {
  const content = `import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
}, { timestamps: true });

export const User = mongoose.model("User", schema);
`;
  return { type: "single", content };
}

async function defaultVariant(ctx = {}) {
  return realistic(ctx);
}

module.exports = { realistic, minimal, enterprise, default: defaultVariant };
