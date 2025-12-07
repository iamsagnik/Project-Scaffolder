async function zustand(ctx = {}) {
  const content = `
import { create } from "zustand";

export const useSessionStore = create(set => ({
  user: null,
  setUser: user => set({ user })
}));
`;
  return { type: "single", content };
}

async function minimal(ctx = {}) {
  const content = `
export const session = { user: null };
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
