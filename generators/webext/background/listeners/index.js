async function standard(ctx = {}) {
  const content = `
export function registerListeners() {
  chrome.tabs.onActivated.addListener(info => {
    console.log("Tab activated", info);
  });
}
`;
  return { type: "single", content };
}

async function extended(ctx = {}) {
  const content = `
export function registerListeners() {
  chrome.tabs.onUpdated.addListener((tabId, change) => {
    console.log("Tab updated", tabId, change);
  });
  chrome.runtime.onMessage.addListener((msg, sender) => {
    console.log("Message received", msg, sender);
  });
}
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return standard(ctx);
}

module.exports = {
  standard,
  extended,
  default: defaultVariant
};
