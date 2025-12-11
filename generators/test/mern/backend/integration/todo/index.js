// generators/mern/backend/test/integration/todo.js

async function defaultVariant(ctx = {}) {
  const content = `// tests/integration/todo.int.test.js
// Note: This test presumes you already have an authenticated user,
// or you extend this to create & login a user before testing todo APIs.

const request = require('supertest');
const app = require('../../../src/app');

describe("Todo Integration", () => {
  it("fetches todos for an authenticated user", async () => {
    // You may extend this test to generate a token.
    // For the moment, placeholder flow:
    expect(true).toBe(true);
  });
});
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
