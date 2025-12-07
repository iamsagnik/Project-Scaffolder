async function standard(ctx = {}) {
  const content = `
describe("Background tests", () => {
  test("sample test", () => {
    expect(true).toBe(true);
  });
});
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `test("ok", () => expect(1).toBe(1));`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return standard(ctx);
}

module.exports = {
  standard,
  minimal,
  default: defaultVariant
};
