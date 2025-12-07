async function standard(ctx = {}) {
  const content = `
export const messaging = {
  send(type, payload) {
    return new Promise(resolve => {
      chrome.runtime.sendMessage({ type, payload }, resolve);
    });
  },

  on(type, handler) {
    chrome.runtime.onMessage.addListener((msg, sender, reply) => {
      if (msg.type === type) handler(msg.payload, sender, reply);
    });
  }
};
`;
  return { type: "single", content };
}

async function strictTyped(ctx = {}) {
  const content = `
/**
 * @template P
 * @param {string} type
 * @param {P} payload
 */
export function sendTyped(type, payload) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type, payload }, resolve);
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
  "strict-typed": strictTyped,
  default: defaultVariant
};
