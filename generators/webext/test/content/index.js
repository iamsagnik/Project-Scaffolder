async function standard(ctx = {}) {
  const content = `
describe("Content script tests", () => {
  test("runs", () => {
    document.body.innerHTML = "<div id='test'></div>";
    expect(document.getElementById("test")).not.toBeNull();
  });
});
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `test("content ok", () => expect(true).toBe(true));`;
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
