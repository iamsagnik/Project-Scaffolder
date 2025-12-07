// generators/react/hook/use-auth.js

async function defaultVariant(ctx = {}) {
  const content = `// src/hooks/useAuth.ts
import { useAuthStore } from '../store/auth.store';

export default function useAuth() {
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);

  return {
    token,
    setToken,
    isAuthenticated: !!token
  };
}
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
