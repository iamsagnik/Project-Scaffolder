// generators/mern/frontend/component/layout/app.js

async function defaultVariant(ctx = {}) {
  const content = `// src/components/layout/AppLayout.tsx
import React from 'react';

export default function AppLayout({ children } : { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <header>Header</header>

      <main>{children}</main>

      <footer>Footer</footer>
    </div>
  );
}
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
