// generators/mern/frontend/page/home.js

async function defaultVariant(ctx = {}) {
  const content = `// src/pages/Home.page.tsx
import React from 'react';

export default function Home() {
  return <div>Welcome to the MERN Enterprise App</div>;
}
`;

  return { type: "single", content };
}

module.exports = { default: defaultVariant };
