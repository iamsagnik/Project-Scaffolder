async function standard(ctx = {}) {
  const content = `
const observer = new MutationObserver(() => {
  console.log("DOM changed");
});
observer.observe(document.body, { childList: true, subtree: true });
`;
  return { type: "single", content };
}

async function lightweight(ctx = {}) {
  const content = `
new MutationObserver(() => {}).observe(document.body, { childList: true });
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return standard(ctx);
}

module.exports = {
  standard,
  lightweight,
  default: defaultVariant
};
