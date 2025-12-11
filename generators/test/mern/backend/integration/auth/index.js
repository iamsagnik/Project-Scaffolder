// generators/mern/backend/test/integration/auth.js

async function defaultVariant(ctx = {}) {
  const content = `// tests/integration/auth.int.test.js
const request = require('supertest');
const app = require('../../../src/app');

describe("Auth Integration", () => {
  it("registers and logs in a user", async () => {

    const email = "test+" + Date.now() + "@mail.com";

    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email, password: "password123" });

    expect(reg.statusCode).toBe(201);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "password123" });

    expect(login.statusCode).toBe(200);
    expect(login.body.token).toBeDefined();
  });
});
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
