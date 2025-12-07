async function standard(ctx = {}) {
  const content = `
export const runtime = {
  getURL: path => chrome.runtime.getURL(path),
  openOptions: () => chrome.runtime.openOptionsPage()
};
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `
export const runtime = {
  getURL: p => p
};
`;
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
