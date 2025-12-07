// generators/mern/frontend/page/dashboard.js

async function defaultVariant(ctx = {}) {
  const content = `// src/pages/Dashboard.page.tsx
import React from 'react';

export default function Dashboard() {
  return <div>Dashboard — Protected Area</div>;
}
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
