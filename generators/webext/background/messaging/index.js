async function standard(ctx = {}) {
  const content = `
export function setupMessaging() {
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "PING") sendResponse({ ok: true });
  });
}
`;
  return { type: "single", content };
}

async function typed(ctx = {}) {
  const content = `
/**
 * @typedef {{ type: string, payload?: any }} Message
 */
export function setupMessaging() {
  chrome.runtime.onMessage.addListener((/** @type Message */ msg, sender, reply) => {
    reply({ received: msg.type });
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
  typed,
  default: defaultVariant
};
