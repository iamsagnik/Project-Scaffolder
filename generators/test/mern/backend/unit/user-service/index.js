// generators/mern/backend/test/unit/user-service.js

async function defaultVariant(ctx = {}) {
  const content = `// tests/unit/user.service.test.js
const userService = require('../../../src/services/user.service');

describe("User Service", () => {
  it("should expose list()", () => {
    expect(typeof userService.list).toBe("function");
  });

  it("should expose getById()", () => {
    expect(typeof userService.getById).toBe("function");
  });
});
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
