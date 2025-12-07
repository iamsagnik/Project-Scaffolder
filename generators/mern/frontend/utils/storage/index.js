// generators/react/util/storage.js

async function defaultVariant(ctx = {}) {
  const content = `// src/utils/storage.ts
export const save = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) { /* ignore */ }
};

export const load = (key: string) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch (e) {
    return null;
  }
};

export const remove = (key: string) => {
  try { localStorage.removeItem(key); } catch (e) {}
};
`;
  return { type: "single", content };
}

module.exports = { default: defaultVariant };
