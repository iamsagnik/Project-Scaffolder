// generators/react/store/auth.js

async function zustand(ctx = {}) {
  const content = `// src/store/auth.store.ts
import create from 'zustand';

type AuthState = {
  token?: string;
  setToken: (token?: string) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token") || undefined,
  setToken: (token) => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
    set({ token });
  }
}));
`;

  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return zustand(ctx);
}

module.exports = {
  zustand,
  default: defaultVariant,
};
