// generators/react/routes/index.js

async function v6(ctx = {}) {
  const content = `// src/routes/index.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

export function RouterIndex({ routes }: { routes: any[] }) {
  return (
    <Routes>
      {routes.map((r) => (
        <Route key={r.path} path={r.path} element={r.element} />
      ))}
    </Routes>
  );
}
`;

  return { type: "single", content };
}

async function defaultVariant(ctx) {
  return v6(ctx);
}

module.exports = {
  v6,
  default: defaultVariant,
};
