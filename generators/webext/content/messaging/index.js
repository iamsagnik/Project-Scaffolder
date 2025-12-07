async function standard(ctx = {}) {
  const content = `
export function sendPing() {
  chrome.runtime.sendMessage({ type: "PING" }, response => {
    console.log("Background responded:", response);
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

export function send(message) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage(/** @type Message */ message, resolve);
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
