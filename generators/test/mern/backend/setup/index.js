async function jestSupertest(ctx = {}) {
  const mongo = ctx.options?.mongoTestUri || "mongodb://localhost:27017/mern_test";

  const content = `// tests/setup.js
process.env.NODE_ENV = "test";

const mongoose = require('mongoose');

beforeAll(async () => {
  await mongoose.connect("${mongo}", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});
`;

  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return jestSupertest(ctx);
}

module.exports = {
  "jest-supertest": jestSupertest,
  default: defaultVariant,
};
