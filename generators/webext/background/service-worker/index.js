async function mv3(ctx = {}) {
  const content = `
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed.");
});
`;
  return { type: "single", content };
}

async function debug(ctx = {}) {
  const content = `
chrome.runtime.onInstalled.addListener(() => {
  console.log("[DEBUG] Installed.");
});
chrome.runtime.onMessage.addListener(msg => console.log("[DEBUG]", msg));
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return mv3(ctx);
}

module.exports = {
  mv3,
  debug,
  default: defaultVariant
};
