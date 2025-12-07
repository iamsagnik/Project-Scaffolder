async function zustand(ctx = {}) {
  const content = `
import { create } from "zustand";

export const useSettingsStore = create(set => ({
  darkMode: false,
  toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode }))
}));
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `
export const settings = { darkMode: false };
`;
  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return zustand(ctx);
}

module.exports = {
  zustand,
  minimal,
  default: defaultVariant
};
