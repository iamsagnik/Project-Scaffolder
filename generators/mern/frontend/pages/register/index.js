// generators/mern/frontend/page/register.js

async function defaultVariant(ctx = {}) {
  const content = `// src/pages/Register.page.tsx
import React, { useState } from 'react';
import { api } from '../config/api';

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/auth/register", { email, password });
    window.location.href = "/login";
  }

  return (
    <form onSubmit={submit}>
      <h2>Register</h2>
      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button>Register</button>
    </form>
  );
}
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
