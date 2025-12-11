async function expressMongo(ctx = {}) {
  const port = ctx.options?.backendPort || 4000;
  const mongo = ctx.options?.mongoUri || "mongodb://localhost:27017/mern_db";

  const content = `PORT=${port}
MONGO_URI=${mongo}
JWT_SECRET=replace_this
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return expressMongo(ctx);
}

module.exports = {
  "express-mongo": expressMongo,
  default: defaultVariant,
};
