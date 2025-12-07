async function chromeStorageSync(ctx = {}) {
  const content = `
export const storage = {
  async get(key) {
    return new Promise(resolve => {
      chrome.storage.sync.get([key], result => resolve(result[key]));
    });
  },

  async set(key, value) {
    return new Promise(resolve => {
      chrome.storage.sync.set({ [key]: value }, resolve);
    });
  }
};
`;
  return { type: "single", content };
}

async function local(ctx = {}) {
  const content = `
export const storage = {
  async get(key) {
    return JSON.parse(localStorage.getItem(key));
  },
  async set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return chromeStorageSync(ctx);
}

module.exports = {
  "chrome-storage-sync": chromeStorageSync,
  local,
  default: defaultVariant
};
